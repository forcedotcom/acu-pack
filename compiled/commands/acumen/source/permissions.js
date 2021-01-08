"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
const command_base_1 = require("../../../lib/command-base");
const utils_1 = require("../../../lib/utils");
const office_1 = require("../../../lib/office");
const path = require("path");
const sfdx_permission_1 = require("../../../lib/sfdx-permission");
class Permissions extends command_base_1.CommandBase {
    constructor() {
        super(...arguments);
        this.defaultReportHeaderName = '_HEADERS_';
    }
    async run() {
        var e_1, _a;
        if (!this.flags.source) {
            this.flags.source = 'force-app';
        }
        // Are we including namespaces?
        const folders = this.flags.folders
            ? this.flags.folders.split()
            : Permissions.defaultMetadataFolders;
        const defaultCwd = path.resolve(process.cwd());
        const appCwd = path.resolve(this.flags.source);
        if (defaultCwd !== appCwd) {
            try {
                process.chdir(this.flags.source);
                this.ux.log(`Scanning metadata in: ${this.flags.source}`);
            }
            catch (err) {
                throw new core_1.SfdxError(`Unable to set path to: ${this.flags.source}`);
            }
        }
        const workbookMap = new Map();
        try {
            this.objectMetadata = new Map();
            this.fieldMetadata = new Map();
            this.permissions = new Map();
            for (const folder of folders) {
                this.ux.log(`Scanning metadata in: ${folder}`);
                try {
                    for (var _b = tslib_1.__asyncValues(utils_1.default.getFilesAsync(folder)), _c; _c = await _b.next(), !_c.done;) {
                        const filePath = _c.value;
                        const json = await utils_1.default.readObjectFromXmlFile(filePath);
                        if (json.CustomObject) {
                            this.processObjectMeta(filePath, json);
                        }
                        if (json.CustomField) {
                            this.processFieldMeta(filePath, json);
                        }
                        if (json.PermissionSet || json.Profile) {
                            this.processPermissionSetMeta(filePath, json);
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
            this.ux.log('Building Permissions Report');
            workbookMap.set('Objects', this.buildSheet('objectPermissions', this.objectMetadata));
            workbookMap.set('Fields', this.buildSheet('fieldPermissions', this.fieldMetadata));
            workbookMap.set('Users', this.buildSheet('userPermissions'));
            workbookMap.set('Apex Classes', this.buildSheet('classAccesses'));
            workbookMap.set('Apex Pages', this.buildSheet('pageAccesses'));
            workbookMap.set('Applications', this.buildSheet('applicationVisibilities'));
            workbookMap.set('Tabs', this.buildSheet('tabVisibilities'));
            workbookMap.set('Record Types', this.buildSheet('recordTypeAccesses'));
        }
        catch (err) {
            throw err;
        }
        finally {
            if (defaultCwd !== appCwd) {
                process.chdir(defaultCwd);
            }
        }
        const reportPath = path.resolve(this.flags.report || Permissions.defaultReportPath);
        this.ux.log(`Writing Report: ${reportPath}`);
        office_1.Office.writeXlxsWorkbook(workbookMap, reportPath);
        this.ux.log('Done.');
        return;
    }
    buildSheet(permCollectionPropertyName, metadataDetails = null) {
        // Build map of metadata to permisisons
        const metaDataToPermissionsMap = new Map();
        for (const [permissionSetName, permissionSet] of this.permissions) {
            const permSetObject = permissionSet[`${permCollectionPropertyName}`] || [];
            // Add permissions for each metadata object
            for (const [apiName, perm] of permSetObject) {
                if (!metaDataToPermissionsMap.has(apiName)) {
                    // create placeholders for missing metadata
                    metaDataToPermissionsMap.set(apiName, []);
                }
                const sheetData = metaDataToPermissionsMap.get(apiName);
                sheetData.push([permissionSetName, sfdx_permission_1.SfdxPermission.getPermisionString(perm)]);
                metaDataToPermissionsMap.set(apiName, sheetData);
            }
        }
        const metaDataRows = new Map();
        const emptyMetadataRow = [];
        if (metadataDetails) {
            // Add metadata details to sheet first
            for (const [apiName, metaDataDetail] of metadataDetails) {
                const metadataData = metaDataToPermissionsMap.get(apiName);
                if (!metadataData) {
                    continue;
                }
                const metadataArray = [];
                for (const [key, value] of Object.entries(metaDataDetail)) {
                    metadataArray.push([key, value]);
                }
                metaDataRows.set(apiName, metadataArray);
                if (emptyMetadataRow.length === 0) {
                    for (const entry of metadataArray) {
                        emptyMetadataRow.push([entry[0], '']);
                    }
                }
            }
        }
        const workbookSheet = [];
        const columns = ['API Name'];
        const typeRow = ['Type'];
        for (const entry of emptyMetadataRow) {
            columns.push(entry[0]);
            typeRow.push('');
        }
        for (const [permName, permSet] of this.permissions) {
            columns.push(permName);
            typeRow.push(permSet.isProfile ? 'Profile' : 'Permission Set');
        }
        // First row is just columns
        workbookSheet.push(columns);
        workbookSheet.push(typeRow);
        const rows = [columns[0], typeRow[0]];
        // Pre-populate rows with API Names
        for (const metadataName of metaDataToPermissionsMap.keys()) {
            // Init array to hold all columns
            const row = new Array(columns.length);
            // set metadata name as first column value
            row[0] = metadataName;
            const metadataValues = metaDataRows.get(metadataName) || emptyMetadataRow;
            for (let index = 0; index < metadataValues.length; index++) {
                row[index + 1] = metadataValues[index][1];
            }
            // Add row
            workbookSheet.push(row);
            // Store metadata name for lookup later
            rows.push(metadataName);
        }
        // We now have a matrix that we can begine to populate
        for (const [apiName, permDatas] of metaDataToPermissionsMap) {
            // Add one to row index to account for header row
            const rowIndex = rows.indexOf(apiName);
            // Compare to zero NOT -1 since we added one above....
            if (rowIndex === 0) {
                throw new Error(`Unable to find apiName:'${apiName}' in row collection`);
            }
            for (const permData of permDatas) {
                // Add one to col index to account for header row
                const colIndex = columns.indexOf(permData[0]);
                // Compare to zero NOT -1 since we added one above....
                if (colIndex === 0) {
                    throw new Error(`Unable to find name:'${permData[0]}' in header collection`);
                }
                // Add data to matrix
                workbookSheet[rowIndex][colIndex] = permData[1];
            }
        }
        return workbookSheet;
    }
    getObjectDetails(name) {
        return this.objectMetadata.get(name) || new sfdx_permission_1.ObjectDetail();
    }
    getFieldDetails(name) {
        return this.fieldMetadata.get(name) || new sfdx_permission_1.FieldDetail();
    }
    processObjectMeta(filePath, json) {
        const objectDetail = sfdx_permission_1.ObjectDetail.fromXml(filePath, json);
        this.objectMetadata.set(objectDetail.name, objectDetail);
    }
    processFieldMeta(filePath, json) {
        const fieldDetail = sfdx_permission_1.FieldDetail.fromXml(filePath, json);
        this.fieldMetadata.set(fieldDetail.name, fieldDetail);
    }
    processPermissionSetMeta(filePath, json) {
        const permSet = sfdx_permission_1.PermissionSet.fromXml(filePath, json);
        this.permissions.set(permSet.name, permSet);
    }
}
exports.default = Permissions;
Permissions.defaultSourceFolder = 'force-app';
Permissions.defaultReportPath = 'PermissionsReport.xlsx';
// Order Matters here!
Permissions.defaultMetadataFolders = [
    '**/objects/*/*.object-meta.xml',
    '**/objects/*/fields/*.field-meta.xml',
    '**/permissionsets/*.permissionset-meta.xml',
    '**/profiles/*.profile-meta.xml'
];
Permissions.description = command_base_1.CommandBase.messages.getMessage('source.permissions.commandDescription');
Permissions.examples = [
    `$ sfdx acumen:source:permissions -d security/report -u myOrgAlias
    Reads security information from source-formatted configuration files (${Permissions.defaultMetadataFolders.join(', ')}) located in '${Permissions.defaultSourceFolder}' and writes the '${Permissions.defaultReportPath}' report file.`
];
Permissions.flagsConfig = {
    source: command_1.flags.string({
        char: 'p',
        description: command_base_1.CommandBase.messages.getMessage('source.permissions.sourceFlagDescription', [Permissions.defaultSourceFolder])
    }),
    report: command_1.flags.string({
        char: 'r',
        description: command_base_1.CommandBase.messages.getMessage('source.permissions.reportFlagDescription', [Permissions.defaultReportPath])
    }),
    folders: command_1.flags.string({
        char: 'f',
        description: command_base_1.CommandBase.messages.getMessage('source.permissions.metadataFoldersFlagDescription', [Permissions.defaultMetadataFolders.join(', ')])
    })
};
Permissions.requiresProject = true;
//# sourceMappingURL=permissions.js.map