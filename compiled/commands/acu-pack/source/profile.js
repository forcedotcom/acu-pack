"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../lib/command-base");
const utils_1 = require("../../../lib/utils");
const sfdx_permission_1 = require("../../../lib/sfdx-permission");
const sfdx_tasks_1 = require("../../../lib/sfdx-tasks");
class Profile extends command_base_1.CommandBase {
    async runInternal() {
        const sourceFolders = !this.flags.source ? Profile.defaultPermissionsGlobs : this.flags.source.split(',');
        this.permissions = new Map();
        let gotStandardTabs = false;
        const sourceFilePaths = new Set();
        const custObjs = [];
        for (const sourceFolder of sourceFolders) {
            if (!sourceFolder) {
                continue;
            }
            this.ux.log(`Reading metadata in: ${sourceFolder}`);
            for await (const filePath of utils_1.default.getFiles(sourceFolder.trim())) {
                this.ux.log(`\tProcessing: ${filePath}`);
                const json = await utils_1.default.readObjectFromXmlFile(filePath);
                if (!json.PermissionSet && !json.Profile) {
                    this.ux.log(`\tUnable to process file: ${filePath}`);
                    continue;
                }
                // Read all the CustomObject typenames PermissionSet from and add to the customObjects Set
                const permSet = sfdx_permission_1.PermissionSet.fromXml(filePath, json);
                custObjs.push(...Array.from(permSet.getPermissionCollection(sfdx_permission_1.SfdxPermission.customObject).keys()));
                // Add to collection for update later
                sourceFilePaths.add(filePath);
            }
        }
        // Debug
        const customObjects = new Set(utils_1.default.sortArray(custObjs));
        this.ux.log(`CustomObjects: ${[...customObjects].join(',')}`);
        // Get Objects and fields first
        const notFoundInOrg = new Set();
        let custFields = [];
        let counter = 0;
        for (const customObject of customObjects) {
            this.ux.log(`Gathering (${++counter}/${customObjects.size}) ${customObject} schema...`);
            try {
                const objMeta = await sfdx_tasks_1.SfdxTasks.describeObject(this.orgAlias, customObject);
                for (const field of objMeta.fields) {
                    custFields.push(`${customObject}.${field.name}`);
                }
            }
            catch (ex) {
                this.ux.log(`Error Gathering ${customObject} schema: ${ex.message}`);
                notFoundInOrg.add(customObject);
            }
        }
        custFields = utils_1.default.sortArray(custFields);
        const customFields = new Set(custFields);
        // Debug
        this.ux.log(`CustomFields: ${[...custFields].join(',')}`);
        // Now get rest - and skip Objects & Fields
        const orgMetaDataMap = new Map();
        orgMetaDataMap.set(sfdx_permission_1.SfdxPermission.customObject, customObjects);
        orgMetaDataMap.set(sfdx_permission_1.SfdxPermission.customField, customFields);
        this.ux.log(`${sfdx_permission_1.SfdxPermission.defaultPermissionMetaTypes.join(',')}`);
        for (const permissionMetaDataType of sfdx_permission_1.SfdxPermission.defaultPermissionMetaTypes) {
            switch (permissionMetaDataType) {
                case sfdx_permission_1.SfdxPermission.customObject:
                case sfdx_permission_1.SfdxPermission.customField:
                    continue;
                default: {
                    const nameSet = new Set();
                    for await (const metaData of sfdx_tasks_1.SfdxTasks.listMetadata(this.orgAlias, permissionMetaDataType)) {
                        if (!metaData.fullName) {
                            this.ux.log(`Error No fullName field on type ${permissionMetaDataType}`);
                            continue;
                        }
                        nameSet.add(metaData.fullName);
                    }
                    orgMetaDataMap.set(permissionMetaDataType, nameSet);
                }
            }
        }
        // Now run back through Permission files and determine if anything is missing in Org
        counter = 0;
        for (const sourceFilePath of sourceFilePaths) {
            const permSetErrors = [];
            const permSetStandardTabs = [];
            this.ux.log(`Verifying (${++counter}/${sourceFilePaths.size}) ${sourceFilePath} schema...`);
            const json = await utils_1.default.readObjectFromXmlFile(sourceFilePath);
            const permSet = sfdx_permission_1.PermissionSet.fromXml(sourceFilePath, json);
            for (const metadataName of sfdx_permission_1.SfdxPermission.defaultPermissionMetaTypes) {
                const permCollection = permSet.getPermissionCollection(metadataName);
                if (!permCollection) {
                    switch (metadataName) {
                        case sfdx_permission_1.SfdxPermission.profile:
                        case sfdx_permission_1.SfdxPermission.permissionSet:
                            // These items are not found in the Profile or PermissionSet XML
                            continue;
                        default:
                            permSetErrors.push(`WARNING: No Permission entries found for ${metadataName}.`);
                            break;
                    }
                    continue;
                }
                let permSetExistingNames = [];
                switch (metadataName) {
                    case sfdx_permission_1.SfdxPermission.customTab:
                        if (permSet.tabVisibilities) {
                            for (const [tabName, tabPerm] of permCollection) {
                                if (tabPerm['isStandard']) {
                                    // Standard Tabs are not exposed via the Metadata API
                                    permSetStandardTabs.push(tabName);
                                    gotStandardTabs = true;
                                    continue;
                                }
                                permSetExistingNames.push(tabName);
                            }
                        }
                        break;
                    default:
                        permSetExistingNames = Array.from(permCollection.keys());
                        break;
                }
                for (const permSetExistingName of permSetExistingNames) {
                    const orgTypeNames = orgMetaDataMap.get(metadataName);
                    if (!orgTypeNames.has(permSetExistingName)) {
                        if (!notFoundInOrg.has(permSetExistingName.split('.')[0])) {
                            permSetErrors.push(`${permSetExistingName} NOT visible/found in Org.`);
                        }
                    }
                }
            }
            if (permSetStandardTabs.length > 0) {
                for (const standardTab of permSetStandardTabs) {
                    permSetErrors.push(`\t${standardTab} (*)`);
                }
            }
            if (permSetErrors.length > 0) {
                this.ux.log('Warnings & Errors:');
                for (const error of permSetErrors) {
                    this.ux.log(`\t\t${error}`);
                }
            }
            if (notFoundInOrg.size > 0) {
                this.ux.log('Objects Not Visible/Found:');
                for (const notFound of notFoundInOrg) {
                    this.ux.log(`\t\t${notFound}`);
                }
            }
            if (this.flags.modify) {
                /*
                const outFilePath = this.flags.output
                  ? path.join(this.flags.output, filePath)
                  : filePath;
        
                this.ux.log(`\tUpdating: ${outFilePath}`);
                await Utils.writeObjectToXmlFile(outFilePath, newPermSet.toXmlObj());
                */
            }
        }
        if (gotStandardTabs) {
            this.ux.log('(*) WARNING: Standard Tab permissions detected.');
            this.ux.log('Salesforce does not expose Standard Tabs via the Metadata API.');
            this.ux.log(`Compatibility with '${this.orgAlias}' can only be ensured if these permissions are removed.`);
        }
        return;
    }
}
exports.default = Profile;
Profile.defaultSourceFolder = null;
Profile.defaultPermissionsGlobs = [
    '**/profiles/*.profile-meta.xml',
    '**/permissionsets/*.permissionset-meta.xml',
];
Profile.description = command_base_1.CommandBase.messages.getMessage('source.profile.commandDescription');
Profile.examples = [
    `$ sfdx acu-pack:source:profile -u myOrgAlias
    Compares the profile metadata files in ${Profile.defaultPermissionsGlobs.join(',')} to the specified Org to detemrine deployment compatibility.`,
    `$ sfdx acu-pack:source:profile -m true -u myOrgAlias
    Compares the profile metadata files in ${Profile.defaultPermissionsGlobs.join(',')} to the specified Org to and updates the metadat files to ensuredeployment compatibility.`,
];
Profile.flagsConfig = {
    source: command_1.flags.string({
        char: 'p',
        description: command_base_1.CommandBase.messages.getMessage('source.profile.profilePathFlagDescription', [
            Profile.defaultPermissionsGlobs.join(','),
        ]),
        required: false,
    }),
    modify: command_1.flags.boolean({
        char: 'm',
        description: command_base_1.CommandBase.messages.getMessage('source.profile.modifyFlagDescription'),
        required: false,
    }),
    output: command_1.flags.string({
        char: 'o',
        description: command_base_1.CommandBase.messages.getMessage('source.profile.outputFoldersFlagDescription'),
        required: false,
    }),
};
Profile.requiresProject = false;
Profile.requiresUsername = true;
//# sourceMappingURL=profile.js.map