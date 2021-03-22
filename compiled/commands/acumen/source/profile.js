"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../lib/command-base");
const utils_1 = require("../../../lib/utils");
const path = require("path");
const sfdx_permission_1 = require("../../../lib/sfdx-permission");
const sfdx_tasks_1 = require("../../../lib/sfdx-tasks");
class Profile extends command_base_1.CommandBase {
    async run() {
        var e_1, _a;
        const sourceFolders = !this.flags.source
            ? Profile.defaultPermissionsGlobs
            : this.flags.source.split(',');
        const orgAlias = this.flags.targetusername;
        this.ux.log('Gathering securable metadata information from Org:');
        this.ux.log(`${sfdx_permission_1.SfdxPermission.defaultPermissionMetaTypes}`);
        const metaDataMap = await sfdx_tasks_1.SfdxTasks.listMetadatas(orgAlias, sfdx_permission_1.SfdxPermission.defaultPermissionMetaTypes);
        this.permissions = new Map();
        let gotStandardTabs = false;
        for (const sourceFolder of sourceFolders) {
            if (!sourceFolder) {
                continue;
            }
            this.ux.log(`Reading metadata in: ${sourceFolder}`);
            try {
                for (var _b = (e_1 = void 0, tslib_1.__asyncValues(utils_1.default.getFiles(sourceFolder.trim()))), _c; _c = await _b.next(), !_c.done;) {
                    const filePath = _c.value;
                    this.ux.log(`\tProcessing: ${filePath}`);
                    const json = await utils_1.default.readObjectFromXmlFile(filePath);
                    if (!json.PermissionSet && !json.Profile) {
                        this.ux.log(`\tUnable to process file: ${filePath}`);
                        continue;
                    }
                    const permSet = sfdx_permission_1.PermissionSet.fromXml(filePath, json);
                    const newPermSet = new sfdx_permission_1.PermissionSet();
                    for (const [metadataName, members] of metaDataMap) {
                        const permSetErrors = [];
                        const existingNames = [];
                        const standardTabs = [];
                        const permCollection = permSet.getPermissionCollection(metadataName);
                        const newPermCollection = newPermSet.getPermissionCollection(metadataName);
                        switch (metadataName) {
                            case sfdx_permission_1.SfdxPermission.customTab:
                                if (permSet.tabVisibilities) {
                                    for (const [tabName, tabPerm] of permCollection) {
                                        if (tabPerm['isStandard']) {
                                            // Standard Tabs are not exposed via the Metadata API
                                            standardTabs.push(tabName);
                                            gotStandardTabs = true;
                                            continue;
                                        }
                                        existingNames.push(tabName);
                                    }
                                }
                                break;
                            default:
                                if (permCollection) {
                                    existingNames.push(...permCollection.keys());
                                }
                        }
                        const typeNames = new Set(members);
                        for (const existingName of existingNames) {
                            if (!typeNames.has(existingName)) {
                                permSetErrors.push(`${existingName} NOT found.`);
                            }
                            else {
                                newPermCollection.set(existingName, permCollection.get(existingName));
                            }
                        }
                        if (standardTabs.length > 0) {
                            for (const standardTab of standardTabs) {
                                permSetErrors.push(`\t${standardTab} (*)`);
                            }
                        }
                        if (permSetErrors.length > 0) {
                            this.ux.log(`\t\t${metadataName}:`);
                            for (const error of permSetErrors) {
                                this.ux.log(`\t\t\t${error}`);
                            }
                        }
                    }
                    if (this.flags.modify) {
                        const outFilePath = this.flags.output
                            ? path.join(this.flags.output, filePath)
                            : filePath;
                        this.ux.log(`\tUpdating: ${outFilePath}`);
                        await utils_1.default.writeObjectToXmlFile(outFilePath, newPermSet.toXmlObj());
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        if (gotStandardTabs) {
            this.ux.log('(*) WARNING: Standard Tab permissions detected.');
            this.ux.log('Salesforce does not expose Standard Tabs via the Metadata API.');
            this.ux.log(`Compatibility with '${orgAlias}' can only be ensured if these permissions are removed.`);
        }
        this.ux.log('Done.');
        return;
    }
}
exports.default = Profile;
Profile.defaultSourceFolder = null;
Profile.defaultPermissionsGlobs = [
    '**/profiles/*.profile-meta.xml',
    '**/permissionsets/*.permissionset-meta.xml'
];
Profile.description = command_base_1.CommandBase.messages.getMessage('source.profile.commandDescription');
Profile.examples = [
    `$ sfdx acumen:source:profile -u myOrgAlias
    Compares the profile metadata files in ${Profile.defaultPermissionsGlobs.join(',')} to the specified Org to detemrine deployment compatibility.`,
    `$ sfdx acumen:source:profile -m true -u myOrgAlias
    Compares the profile metadata files in ${Profile.defaultPermissionsGlobs.join(',')} to the specified Org to detemrine deployment compatibility.`
];
Profile.flagsConfig = {
    source: command_1.flags.string({
        char: 'p',
        description: command_base_1.CommandBase.messages.getMessage('source.profile.profilePathFlagDescription', [Profile.defaultPermissionsGlobs.join(',')]),
        required: false
    }),
    modify: command_1.flags.boolean({
        char: 'm',
        description: command_base_1.CommandBase.messages.getMessage('source.profile.modifyFlagDescription'),
        required: false
    }),
    output: command_1.flags.string({
        char: 'o',
        description: command_base_1.CommandBase.messages.getMessage('source.profile.outputFoldersFlagDescription'),
        required: false
    })
};
Profile.requiresProject = false;
Profile.requiresUsername = true;
//# sourceMappingURL=profile.js.map