"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SfdxQuery = exports.SfdxCodeCoverageItem = exports.SfdxCodeCoverage = exports.SfdxObjectPermission = exports.SfdxFieldPermission = exports.SfdxPermission = exports.SfdxPermissionSet = exports.SfdxFolder = exports.SfdxSeupEntityAccess = exports.SfdxEntity = void 0;
const tslib_1 = require("tslib");
const constants_1 = require("./constants");
const sfdx_core_1 = require("./sfdx-core");
const utils_1 = require("./utils");
class SfdxEntity {
}
exports.SfdxEntity = SfdxEntity;
class SfdxSeupEntityAccess {
}
exports.SfdxSeupEntityAccess = SfdxSeupEntityAccess;
class SfdxFolder extends SfdxEntity {
}
exports.SfdxFolder = SfdxFolder;
class SfdxPermissionSet extends SfdxEntity {
}
exports.SfdxPermissionSet = SfdxPermissionSet;
class SfdxPermission extends SfdxEntity {
}
exports.SfdxPermission = SfdxPermission;
class SfdxFieldPermission extends SfdxPermission {
    constructor() {
        super(...arguments);
        this.permissionType = 'Field';
    }
}
exports.SfdxFieldPermission = SfdxFieldPermission;
class SfdxObjectPermission extends SfdxPermission {
    constructor() {
        super(...arguments);
        this.permissionType = 'Object';
    }
}
exports.SfdxObjectPermission = SfdxObjectPermission;
class SfdxCodeCoverage {
    constructor() {
        this.codeCoverage = [];
    }
    calculateCodeCoverage() {
        if (!this.codeCoverage) {
            return;
        }
        this.totalCoveredLines = 0;
        this.totalUncoveredLines = 0;
        let totalLines = 0;
        for (const item of this.codeCoverage) {
            if (!item.coveredLines || !item.uncoveredLines) {
                continue;
            }
            if (item.coveredLines) {
                this.totalCoveredLines += item.coveredLines.length;
            }
            if (item.uncoveredLines) {
                this.totalUncoveredLines += item.uncoveredLines.length;
            }
            totalLines += item.coveredLines.length + item.uncoveredLines.length;
        }
        this.codeCoveragePercent = totalLines === 0 ? 0 : (this.totalCoveredLines / totalLines) * 100;
    }
}
exports.SfdxCodeCoverage = SfdxCodeCoverage;
class SfdxCodeCoverageItem extends SfdxEntity {
    constructor() {
        super();
        this.coveredLines = [];
        this.uncoveredLines = [];
    }
    getCodeCoveragePercent() {
        const totalLines = this.coveredLines.length + this.uncoveredLines.length;
        return totalLines === 0 ? 0 : (this.coveredLines.length / totalLines) * 100;
    }
}
exports.SfdxCodeCoverageItem = SfdxCodeCoverageItem;
class SfdxQuery {
    // Query Custom Application info - they are called TabSet in SOQL
    static async getCustomApplications(usernameOrAlias) {
        const query = "SELECT Id, ApplicationId, Label FROM AppMenuItem WHERE Type='TabSet'";
        const records = await SfdxQuery.doSoqlQuery(usernameOrAlias, query);
        const customApplications = [];
        for (const record of records) {
            const customApplication = new SfdxEntity();
            customApplication.id = record.Id;
            customApplication.name = record.Label;
            customApplications.push(customApplication);
        }
        return customApplications;
    }
    // Get current SetupEntityAccess types i.e. ApexClass, ApexPage,TabeSet, etc...
    // https://developer.salesforce.com/docs/atlas.en-us.226.0.object_reference.meta/object_reference/sforce_api_objects_setupentityaccess.htm
    //
    static async getSetupEntityTypes(usernameOrAlias) {
        const query = 'SELECT SetupEntityType FROM SetupEntityAccess GROUP BY SetupEntityType';
        const records = await SfdxQuery.doSoqlQuery(usernameOrAlias, query);
        const setupEntityTypes = [];
        for (const record of records) {
            setupEntityTypes.push(record.SetupEntityType);
        }
        return setupEntityTypes;
    }
    // Get the SfdxFolder structure. SFDX only return parent folder information in the metadata. Need to build grandparent
    // structure for Reports, Dashboards, etc...
    static async getFolders(usernameOrAlias) {
        const query = 'SELECT Id,ParentId,Name,DeveloperName,Type FROM Folder ORDER BY ParentId';
        const records = await SfdxQuery.doSoqlQuery(usernameOrAlias, query);
        const folders = [];
        for (const record of records) {
            const folder = new SfdxFolder();
            folder.id = record.Id;
            folder.name = record.Name;
            folder.type = record.Type;
            folder.parentId = record.ParentId;
            folder.developerName = record.DeveloperName;
            folders.push(folder);
        }
        return folders;
    }
    // Pulls SfdxPermissionSet for Profile & PermissionsSet info
    static async getPermissions(usernameOrAlias) {
        var _a;
        const query = 'SELECT Id,Name,Profile.Name,IsOwnedByProfile FROM PermissionSet ORDER BY Profile.Name, Name';
        const records = await SfdxQuery.doSoqlQuery(usernameOrAlias, query);
        const profileMap = new Map();
        for (const record of records) {
            const profile = new SfdxPermissionSet();
            profile.id = record.Id;
            profile.name = record.Name;
            profile.profileName = (_a = record.Profile) === null || _a === void 0 ? void 0 : _a.Name;
            profile.isOwnedByProfile = record.IsOwnedByProfile;
            profileMap.set(profile.id, profile);
        }
        return profileMap;
    }
    // Gets the SfdxObjectPermission Permissions for the specified object type
    static async getObjectPermissions(usernameOrAlias, customObjectTypeName) {
        const query = `SELECT Id,ParentId,PermissionsCreate,PermissionsDelete,PermissionsEdit,PermissionsModifyAllRecords,PermissionsRead,PermissionsViewAllRecords,SObjectType FROM ObjectPermissions WHERE SObjectType='${customObjectTypeName}' ORDER BY SObjectType`;
        const records = await SfdxQuery.doSoqlQuery(usernameOrAlias, query);
        const objPerms = new Array();
        for (const record of records) {
            const perm = new SfdxObjectPermission();
            perm.id = record.Id;
            perm.name = record.SobjectType;
            perm.parentId = record.ParentId;
            perm.permissionsCreate = record.PermissionsCreate;
            perm.permissionsDelete = record.PermissionsDelete;
            perm.permissionsModifyAllRecords = record.PermissionsModifyAllRecords;
            perm.permissionsViewAllRecords = record.PermissionsViewAllRecords;
            perm.permissionsEdit = record.PermissionsEdit;
            perm.permissionsRead = record.PermissionsRead;
            objPerms.push(perm);
        }
        return objPerms;
    }
    // Get the SfdxFieldPermission permissions for the specific object type
    static async getFieldPermissions(usernameOrAlias, customObjectTypeName) {
        const query = `SELECT Id,ParentId,PermissionsEdit,PermissionsRead,Field FROM FieldPermissions WHERE SobjectType = '${customObjectTypeName}' ORDER BY Field`;
        const records = await SfdxQuery.doSoqlQuery(usernameOrAlias, query);
        const objPerms = new Array();
        for (const record of records) {
            const perm = new SfdxFieldPermission();
            perm.id = record.Id;
            perm.name = record.Field;
            perm.parentId = record.ParentId;
            perm.permissionsEdit = record.PermissionsEdit;
            perm.permissionsRead = record.PermissionsRead;
            objPerms.push(perm);
        }
        return objPerms;
    }
    // Gets the SfdxSetupEntityAccess inforamtion for the specified SetupEntityTypes
    static async getSetupEntityAccessForTypes(usernameOrAlias, setupEntityTypeNames) {
        const entityTypes = setupEntityTypeNames
            ? setupEntityTypeNames.join("','")
            : '';
        const query = `SELECT SetupEntityId,SetupEntityType FROM SetupEntityAccess WHERE SetupEntityType IN ('${entityTypes}') GROUP BY SetupEntityId,SetupEntityType ORDER BY SetupEntityType`;
        const records = await SfdxQuery.doSoqlQuery(usernameOrAlias, query);
        const seupEntityAccesses = [];
        for (const record of records) {
            const seupEntityAccess = new SfdxSeupEntityAccess();
            seupEntityAccess.setupEntityType = record.SetupEntityType;
            seupEntityAccess.setupEntityId = record.SetupEntityId;
            seupEntityAccesses.push(seupEntityAccess);
        }
        return seupEntityAccesses;
    }
    static async doSoqlQuery(usernameOrAlias, query, recordOffset = null, recordLimit = null, isToolingAPIQuery = false) {
        const records = [];
        const queryCmd = isToolingAPIQuery ? `${constants_1.default.SFDX_DATA_QUERY} -t` : constants_1.default.SFDX_DATA_QUERY;
        if (!recordLimit) {
            const cmd = `${queryCmd} -q \"${query}\" --json -u ${usernameOrAlias}`;
            const results = await sfdx_core_1.SfdxCore.command(cmd);
            if (results && results.done) {
                records.push(...results.records);
            }
        }
        else {
            let offset = recordOffset;
            const limitedQuery = `${query} LIMIT ${recordLimit}`;
            while (true) {
                let currentQuery = limitedQuery;
                if (offset) {
                    currentQuery = `${limitedQuery} OFFSET ${offset}`;
                }
                const cmd = `${queryCmd} -q \"${currentQuery}\" --json -u ${usernameOrAlias}`;
                const results = await sfdx_core_1.SfdxCore.command(cmd);
                if (results && results.done) {
                    records.push(...results.records);
                }
                if (results.records.length < recordLimit) {
                    break;
                }
                offset += results.records.length;
            }
        }
        return records;
    }
    // Gets the SfdxSetupEntityAccess inforamtion for the specified SetupEntityTypes
    static async getApexTestClasses(usernameOrAlias, namespacePrefixes = ['']) {
        if (!usernameOrAlias) {
            return null;
        }
        let query = 'SELECT Id, Name, SymbolTable FROM ApexClass WHERE NamespacePrefix';
        if (namespacePrefixes.length === 1) {
            query += ` = '${namespacePrefixes[0]}'`;
        }
        else {
            let namespaces = '';
            for (const ns of namespacePrefixes) {
                if (namespaces.length > 0) {
                    namespaces += ',';
                }
                namespaces += `'${ns}'`;
            }
            query += ` IN (${namespaces})`;
        }
        query += ' ORDER BY Name ASC';
        const records = await SfdxQuery.doSoqlQuery(usernameOrAlias, query, null, null, true);
        const apexClasses = [];
        for (const record of records) {
            let isTest = false;
            if (!record.SymbolTable || !record.SymbolTable.methods) {
                continue;
            }
            for (const method of record.SymbolTable.methods) {
                for (const annotation of method.annotations) {
                    if (annotation.name === 'IsTest') {
                        isTest = true;
                        break;
                    }
                }
                if (isTest) {
                    const entity = new SfdxEntity();
                    entity.id = record.Id;
                    entity.name = record.Name;
                    apexClasses.push(entity);
                    break;
                }
            }
        }
        return apexClasses;
    }
    static async getCodeCoverage(usernameOrAlias) {
        var _a;
        if (!usernameOrAlias) {
            return null;
        }
        const codeCoverage = new SfdxCodeCoverage();
        codeCoverage.codeCoverage = [];
        const query = 'SELECT ApexClassOrTrigger.Name,ApexClassOrTriggerId,NumLinesCovered,NumLinesUncovered,Coverage FROM ApexCodeCoverageAggregate ORDER BY ApexClassOrTrigger.Name ASC';
        const records = await SfdxQuery.doSoqlQuery(usernameOrAlias, query, null, null, true);
        for (const record of records) {
            const coverageItem = new SfdxCodeCoverageItem();
            coverageItem.id = record.ApexClassOrTriggerId;
            coverageItem.name = (_a = record.ApexClassOrTrigger) === null || _a === void 0 ? void 0 : _a.Name;
            coverageItem.uncoveredLines = record.Coverage.uncoveredLines || [];
            coverageItem.coveredLines = record.Coverage.coveredLines || [];
            codeCoverage.codeCoverage.push(coverageItem);
        }
        return codeCoverage;
    }
    static waitForRecordCount(usernameOrAlias, query, recordCount = 0, maxWaitSeconds = 60, sleepMiliseconds = 5000) {
        return tslib_1.__asyncGenerator(this, arguments, function* waitForRecordCount_1() {
            const maxCounter = (maxWaitSeconds * 1000) / sleepMiliseconds;
            let counter = 0;
            let records = [];
            while (maxCounter <= 0 || counter <= maxCounter) {
                yield tslib_1.__await(utils_1.default.sleep(sleepMiliseconds));
                records = yield tslib_1.__await(SfdxQuery.doSoqlQuery(usernameOrAlias, query));
                yield yield tslib_1.__await(records.length);
                counter++;
                if (records.length === recordCount) {
                    break;
                }
            }
        });
    }
    static waitForApexTests(username, waitCountMaxSeconds = 0, createdDate = new Date().toJSON()) {
        return tslib_1.__asyncGenerator(this, arguments, function* waitForApexTests_1() {
            var e_1, _a;
            const query = `SELECT ApexClassId, ShouldSkipCodeCoverage, Status, CreatedDate FROM ApexTestQueueItem WHERE CreatedDate > ${createdDate} AND Status NOT IN ('Completed', 'Failed', 'Aborted')`;
            const targetCount = 0;
            let recordCount = 0;
            // Check every 30 seconds or waitCountMaxSeconds so we don't waste a bunch of queries
            const interval = waitCountMaxSeconds >= 30 ? 30000 : waitCountMaxSeconds;
            try {
                for (var _b = tslib_1.__asyncValues(SfdxQuery.waitForRecordCount(username, query, targetCount, waitCountMaxSeconds, interval)), _c; _c = yield tslib_1.__await(_b.next()), !_c.done;) {
                    recordCount = _c.value;
                    yield yield tslib_1.__await(recordCount);
                    if (recordCount === targetCount) {
                        break;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield tslib_1.__await(_a.call(_b));
                }
                finally { if (e_1) throw e_1.error; }
            }
            return yield tslib_1.__await(recordCount);
        });
    }
    // Gets the SfdxSetupEntityAccess inforamtion for the specified SetupEntityTypes
    static getInClause(values = [''], isValueNumeric = false) {
        let inClause = '';
        if (isValueNumeric) {
            inClause = values.join(',');
        }
        else {
            for (const value of values) {
                if (inClause.length > 0) {
                    inClause += ',';
                }
                inClause += `'${value}'`;
            }
        }
        return `IN (${inClause})`;
    }
}
exports.SfdxQuery = SfdxQuery;
SfdxQuery.MAX_QUERY_LIMIT = 1000;
//# sourceMappingURL=sfdx-query.js.map