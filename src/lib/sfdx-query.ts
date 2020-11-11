import { SfdxCore } from './sfdx-core';
import Utils from './utils';

export class SfdxEntity {
    public id: string;
    public parentId: string;
    public name: string;
}

export class SfdxSeupEntityAccess {
    public setupEntityId: string;
    public setupEntityType: string;
}

export class SfdxFolder extends SfdxEntity {
    public developerName: string;
    public type: string;
}

export class SfdxPermissionSet extends SfdxEntity {
    public isOwnedByProfile: boolean;
    public profileName: string;
}

export abstract class SfdxPermission extends SfdxEntity {
    public abstract permissionType: string;
    public permissionsEdit: boolean;
    public permissionsRead: boolean;
}

export class SfdxFieldPermission extends SfdxPermission {
    public permissionType: string = 'Field';
    public field: string;
}

export class SfdxObjectPermission extends SfdxPermission {
    public permissionType: string = 'Object';
    public permissionsCreate: boolean;
    public permissionsDelete: boolean;
    public permissionsModifyAllRecords: boolean;
    public permissionsViewAllRecords: boolean;
}

export class SfdxCodeCoverage {
    public codeCoverage: SfdxCodeCoverageItem[];
    public totalCoveredLines: number;
    public totalUncoveredLines: number;
    public codeCoveragePercent: number;

    constructor() {
        this.codeCoverage = [];
    }

    public calculateCodeCoverage(): void {
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

export class SfdxCodeCoverageItem extends SfdxEntity {
    public codeCoverage: number;
    public coveredLines: number[];
    public uncoveredLines: number[];

    constructor() {
        super();
        this.coveredLines = [];
        this.uncoveredLines = [];
    }

    public getCodeCoveragePercent(): number {
        const totalLines = this.coveredLines.length + this.uncoveredLines.length;
        return totalLines === 0 ? 0 : (this.coveredLines.length / totalLines) * 100;
    }
}

export class SfdxQuery {
    public static MAX_QUERY_LIMIT = 1000;

    // Query Custom Application info - they are called TabSet in SOQL
    public static async getCustomApplicationsAsync(usernameOrAlias: string): Promise<SfdxEntity[]> {
        const query = "SELECT Id, ApplicationId, Label FROM AppMenuItem WHERE Type='TabSet'";
        const records = await SfdxQuery.doSoqlQueryAsync(usernameOrAlias, query);
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
    public static async getSetupEntityTypesAsync(usernameOrAlias: string): Promise<string[]> {
        const query = 'SELECT SetupEntityType FROM SetupEntityAccess GROUP BY SetupEntityType';
        const records = await SfdxQuery.doSoqlQueryAsync(usernameOrAlias, query);
        const setupEntityTypes = [];
        for (const record of records) {
            setupEntityTypes.push(record.SetupEntityType);
        }
        return setupEntityTypes;
    }

    // Get the SfdxFolder structure. SFDX only return parent folder information in the metadata. Need to build grandparent
    // structure for Reports, Dashboards, etc...
    public static async getFoldersAsync(usernameOrAlias: string): Promise<SfdxFolder[]> {
        const query = 'SELECT Id,ParentId,Name,DeveloperName,Type FROM Folder ORDER BY ParentId';
        const records = await SfdxQuery.doSoqlQueryAsync(usernameOrAlias, query);
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
    public static async getPermissionsAsync(usernameOrAlias: string): Promise<Map<string, SfdxPermissionSet>> {
        const query = 'SELECT Id,Name,Profile.Name,IsOwnedByProfile FROM PermissionSet ORDER BY Profile.Name, Name';
        const records = await SfdxQuery.doSoqlQueryAsync(usernameOrAlias, query);
        const profileMap = new Map<string, SfdxPermissionSet>();
        for (const record of records) {
            const profile = new SfdxPermissionSet();
            profile.id = record.Id;
            profile.name = record.Name;
            profile.profileName = record.Profile?.Name;
            profile.isOwnedByProfile = record.IsOwnedByProfile;
            profileMap.set(profile.id, profile);
        }
        return profileMap;
    }

    // Gets the SfdxObjectPermission Permissions for the specified object type
    public static async getObjectPermissionsAsync(usernameOrAlias: string, customObjectTypeName: string): Promise<SfdxObjectPermission[]> {
        const query = `SELECT Id,ParentId,PermissionsCreate,PermissionsDelete,PermissionsEdit,PermissionsModifyAllRecords,PermissionsRead,PermissionsViewAllRecords,SObjectType FROM ObjectPermissions WHERE SObjectType='${customObjectTypeName}' ORDER BY SObjectType`;
        const records = await SfdxQuery.doSoqlQueryAsync(usernameOrAlias, query);
        const objPerms = new Array<SfdxObjectPermission>();
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
    public static async getFieldPermissionsAsync(usernameOrAlias: string, customObjectTypeName: string): Promise<SfdxFieldPermission[]> {
        const query = `SELECT Id,ParentId,PermissionsEdit,PermissionsRead,Field FROM FieldPermissions WHERE SobjectType = '${customObjectTypeName}' ORDER BY Field`;
        const records = await SfdxQuery.doSoqlQueryAsync(usernameOrAlias, query);
        const objPerms = new Array<SfdxFieldPermission>();
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
    public static async getSetupEntityAccessForTypesAsync(usernameOrAlias: string, setupEntityTypeNames: string[]): Promise<SfdxSeupEntityAccess[]> {
        const entityTypes = setupEntityTypeNames
            ? setupEntityTypeNames.join("','")
            : '';

        const query = `SELECT SetupEntityId,SetupEntityType FROM SetupEntityAccess WHERE SetupEntityType IN ('${entityTypes}') GROUP BY SetupEntityId,SetupEntityType ORDER BY SetupEntityType`;
        const records = await SfdxQuery.doSoqlQueryAsync(usernameOrAlias, query);
        const seupEntityAccesses = [];
        for (const record of records) {
            const seupEntityAccess = new SfdxSeupEntityAccess();
            seupEntityAccess.setupEntityType = record.SetupEntityType;
            seupEntityAccess.setupEntityId = record.SetupEntityId;
            seupEntityAccesses.push(seupEntityAccess);
        }
        return seupEntityAccesses;
    }

    public static async doSoqlQueryAsync(usernameOrAlias: string, query: string, recordOffset: number = null, recordLimit: number = null, isToolingAPIQuery: boolean = false): Promise<any[]> {
        const records = [];
        const queryCmd = isToolingAPIQuery ? 'sfdx force:data:soql:query -t' : 'sfdx force:data:soql:query';
        if (!recordLimit) {
            const cmd = `${queryCmd} -q \"${query}\" --json -u ${usernameOrAlias}`;
            const results = await SfdxCore.command(cmd);
            if (results && results.done) {
                records.push(...results.records);
            }
        } else {
            let offset = recordOffset;
            const limitedQuery = `${query} LIMIT ${recordLimit}`;
            while (true) {
                let currentQuery = limitedQuery;
                if (offset) {
                    currentQuery = `${limitedQuery} OFFSET ${offset}`;
                }
                const cmd = `${queryCmd} -q \"${currentQuery}\" --json -u ${usernameOrAlias}`;
                const results = await SfdxCore.command(cmd);
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
    public static async getApexTestClassesAsync(usernameOrAlias: string, namespacePrefixes: string[] = ['']): Promise<SfdxEntity[]> {
        if (!usernameOrAlias) {
            return null;
        }
        let query = 'SELECT Id, Name, SymbolTable FROM ApexClass WHERE NamespacePrefix';
        if (namespacePrefixes.length === 1) {
            query += ` = '${namespacePrefixes[0]}'`;
        } else {
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
        const records = await SfdxQuery.doSoqlQueryAsync(usernameOrAlias, query, null, null, true);
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

    public static async getCodeCoverageAsync(usernameOrAlias: string): Promise<SfdxCodeCoverage> {
        if (!usernameOrAlias) {
            return null;
        }
        const codeCoverage = new SfdxCodeCoverage();
        codeCoverage.codeCoverage = [];
        const query = 'SELECT ApexClassOrTrigger.Name,ApexClassOrTriggerId,NumLinesCovered,NumLinesUncovered,Coverage FROM ApexCodeCoverageAggregate ORDER BY ApexClassOrTrigger.Name ASC';
        const records = await SfdxQuery.doSoqlQueryAsync(usernameOrAlias, query, null, null, true);
        for (const record of records) {
            const coverageItem = new SfdxCodeCoverageItem();
            coverageItem.id = record.ApexClassOrTriggerId;
            coverageItem.name = record.ApexClassOrTrigger?.Name;
            coverageItem.uncoveredLines = record.Coverage.uncoveredLines || [];
            coverageItem.coveredLines = record.Coverage.coveredLines || [];
            codeCoverage.codeCoverage.push(coverageItem);
        }
        return codeCoverage;
    }

    public static async* waitForRecordCount(usernameOrAlias: string, query: string, recordCount = 0, maxWaitSeconds = 60, sleepMiliseconds = 5000) {
        const maxCounter = (maxWaitSeconds * 1000) / sleepMiliseconds;
        let counter = 0;
        let records = [];
        while (maxCounter < 0 || counter <= maxCounter) {
            await Utils.sleep(sleepMiliseconds);

            records = await SfdxQuery.doSoqlQueryAsync(usernameOrAlias, query);
            yield records.length;

            counter++;

            if (records.length === recordCount) {
                break;
            }
        }
    }

    public static async* waitForApexTestsAsync(username: string, waitCountMaxSeconds: number, createdDate: string = new Date().toJSON()) {
        const query = `SELECT ApexClassId, ShouldSkipCodeCoverage, Status, CreatedDate FROM ApexTestQueueItem WHERE CreatedDate > ${createdDate} AND Status NOT IN ('Completed', 'Failed', 'Aborted')`;
        const targetCount = 0;

        let recordCount = 0;
        // Check every 30 seconds or waitCountMaxSeconds so we don't waste a bunch of queries
        const interval = waitCountMaxSeconds >= 30 ? 30000 : waitCountMaxSeconds;
        for await (recordCount of SfdxQuery.waitForRecordCount(username, query, targetCount, waitCountMaxSeconds, interval)) {
            if (recordCount !== targetCount) {
                yield recordCount;
            } else {
                break;
            }
        }
        return recordCount;
    }

}
