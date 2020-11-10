"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
const command_base_1 = require("../../../lib/command-base");
const utils_1 = require("../../../lib/utils");
const office_1 = require("../../../lib/office");
const path = require("path");
const xml_merge_1 = require("../../../lib/xml-merge");
// @ts-ignore
const tabVisibilityKind = {
    OFF: 'DefaultOff',
    ON: 'DefaultOn',
    HIDDEN: 'Hidden'
};
class MetadataDetail {
}
class ObjectDetail extends MetadataDetail {
}
class FieldDetail extends MetadataDetail {
}
class NamedPermission {
}
class ReadPermission extends NamedPermission {
}
class FieldPermission extends ReadPermission {
}
class ClassPermission extends ReadPermission {
}
class UserPermission extends ReadPermission {
}
class PagePermission extends ReadPermission {
}
class DefaultablePermission extends ReadPermission {
}
class RecordTypePermission extends DefaultablePermission {
}
class ApplicationPermission extends DefaultablePermission {
}
class TabPermission extends ReadPermission {
}
class ObjectPermission extends FieldPermission {
}
class PermissionSet {
}
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
                        const json = await xml_merge_1.default.parseXmlFromFile(filePath);
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
                sheetData.push([permissionSetName, this.getPermisionString(perm)]);
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
    getPermisionString(permissionSet) {
        let result = '';
        if (permissionSet instanceof ObjectPermission) {
            const perm = permissionSet;
            if (perm.modAll) {
                return 'All';
            }
            if (perm.c) {
                result += 'C ';
            }
            if (perm.r) {
                result += 'R ';
            }
            if (perm.u) {
                result += 'U ';
            }
            if (perm.d) {
                result += 'D ';
            }
            if (perm.viewAll) {
                result += 'V ';
            }
        }
        else if (permissionSet instanceof FieldPermission) {
            const perm = permissionSet;
            if (perm.r) {
                result += 'R ';
            }
            if (perm.u) {
                result += 'U ';
            }
        }
        else if (permissionSet instanceof TabPermission) {
            const perm = permissionSet;
            if (perm.r) {
                result += 'R ';
            }
            if (perm.visibility) {
                switch (perm.visibility) {
                    case tabVisibilityKind.ON:
                        result += 'ON ';
                        break;
                    case tabVisibilityKind.OFF:
                        result += 'OFF ';
                        break;
                    case tabVisibilityKind.HIDDEN:
                        result += 'HIDE ';
                        break;
                }
            }
        }
        else if (permissionSet instanceof RecordTypePermission ||
            permissionSet instanceof ApplicationPermission) {
            const perm = permissionSet;
            if (perm.r) {
                result += 'R ';
            }
            if (perm.default) {
                result += '* ';
            }
        }
        else if (permissionSet instanceof UserPermission ||
            permissionSet instanceof ClassPermission ||
            permissionSet instanceof PagePermission) {
            const perm = permissionSet;
            if (perm.r) {
                result += 'R ';
            }
        }
        return result.length === 0
            ? ''
            : result.trimRight();
    }
    getObjectDetails(name) {
        return this.objectMetadata.get(name) || new ObjectDetail();
    }
    getFieldDetails(name) {
        return this.fieldMetadata.get(name) || new FieldDetail();
    }
    processObjectMeta(filePath, json) {
        const name = path.basename(filePath.split('.')[0]);
        const objectDetail = this.getObjectDetails(name);
        objectDetail.label = this.getValue(json.CustomObject.label);
        objectDetail.intSharingModel = this.getValue(json.CustomObject.sharingModel);
        objectDetail.extSharingModel = this.getValue(json.CustomObject.externalSharingModel);
        objectDetail.visibility = this.getValue(json.CustomObject.visibility);
        this.objectMetadata.set(name, objectDetail);
    }
    processFieldMeta(filePath, json) {
        const objectName = path.parse(path.dirname(path.dirname(filePath))).name;
        const fullname = `${objectName}.${path.basename(filePath.split('.')[0])}`;
        const fieldDetail = this.getFieldDetails(fullname);
        fieldDetail.label = this.getValue(json.CustomField.label);
        fieldDetail.description = this.getValue(json.CustomField.description);
        fieldDetail.type = this.getValue(json.CustomField.type);
        fieldDetail.encryptionScheme = this.getValue(json.CustomField.encryptionScheme);
        this.fieldMetadata.set(fullname, fieldDetail);
    }
    processPermissionSetMeta(filePath, json) {
        const name = path.basename(filePath.split('.')[0]);
        const permSet = this.permissions.get(name) || new PermissionSet();
        const root = json.PermissionSet || json.Profile;
        permSet.isProfile = json.Profile ? true : false;
        for (const fldPerm of root.fieldPermissions || []) {
            const fieldPermission = new FieldPermission();
            fieldPermission.name = this.getValue(fldPerm.field);
            fieldPermission.u = this.getValue(fldPerm.editable) || false;
            fieldPermission.r = this.getValue(fldPerm.readable) || false;
            if (!permSet.fieldPermissions) {
                permSet.fieldPermissions = new Map();
            }
            permSet.fieldPermissions.set(fieldPermission.name, fieldPermission);
        }
        for (const usrPerm of root.userPermissions || []) {
            const userPermission = new UserPermission();
            userPermission.r = this.getValue(usrPerm.enabled) || false;
            userPermission.name = this.getValue(usrPerm.name);
            if (!permSet.userPermissions) {
                permSet.userPermissions = new Map();
            }
            permSet.userPermissions.set(userPermission.name, userPermission);
        }
        for (const classPerm of root.classAccesses || []) {
            const classPermission = new ClassPermission();
            classPermission.r = this.getValue(classPerm.enabled) || false;
            classPermission.name = this.getValue(classPerm.apexClass);
            if (!permSet.classAccesses) {
                permSet.classAccesses = new Map();
            }
            permSet.classAccesses.set(classPermission.name, classPermission);
        }
        for (const pagePerm of root.pageAccesses || []) {
            const pagePermission = new PagePermission();
            pagePermission.r = this.getValue(pagePerm.enabled) || false;
            pagePermission.name = this.getValue(pagePerm.apexPage);
            if (!permSet.pageAccesses) {
                permSet.pageAccesses = new Map();
            }
            permSet.pageAccesses.set(pagePermission.name, pagePermission);
        }
        for (const recPerm of root.recordTypeVisibilities || []) {
            const recPermission = new RecordTypePermission();
            recPermission.r = this.getValue(recPerm.visible) || false;
            recPermission.name = this.getValue(recPerm.recordType);
            recPermission.default = this.getValue(recPerm.default);
            if (!permSet.recordTypeAccesses) {
                permSet.recordTypeAccesses = new Map();
            }
            permSet.recordTypeAccesses.set(recPermission.name, recPermission);
        }
        for (const tabPerm of root.tabVisibilities || []) {
            const tabPermission = new TabPermission();
            tabPermission.visibility = this.getValue(tabPerm.visibility);
            tabPermission.name = this.getValue(tabPerm.tab);
            if (!permSet.tabVisibilities) {
                permSet.tabVisibilities = new Map();
            }
            permSet.tabVisibilities.set(tabPermission.name, tabPermission);
        }
        for (const appPerm of root.applicationVisibilities || []) {
            const appPermission = new ApplicationPermission();
            appPermission.r = this.getValue(appPerm.visible);
            appPermission.default = this.getValue(appPerm.default);
            appPermission.name = this.getValue(appPerm.application);
            if (!permSet.applicationVisibilities) {
                permSet.applicationVisibilities = new Map();
            }
            permSet.applicationVisibilities.set(appPermission.name, appPermission);
        }
        for (const objPerm of root.objectPermissions || []) {
            const objPermission = new ObjectPermission();
            objPermission.name = this.getValue(objPerm.object);
            objPermission.c = this.getValue(objPerm.allowCreate);
            objPermission.r = this.getValue(objPerm.allowRead);
            objPermission.u = this.getValue(objPerm.allowEdit);
            objPermission.d = this.getValue(objPerm.allowDelete);
            objPermission.viewAll = this.getValue(objPerm.viewAllRecords);
            objPermission.modAll = this.getValue(objPerm.modifyAllRecords);
            if (!permSet.objectPermissions) {
                permSet.objectPermissions = new Map();
            }
            permSet.objectPermissions.set(objPermission.name, objPermission);
        }
        this.permissions.set(name, permSet);
    }
    getValue(json) {
        const value = json && json instanceof Array
            ? json[0]
            : json;
        return value === 'true' || value === 'false'
            ? value === 'true'
            : value;
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