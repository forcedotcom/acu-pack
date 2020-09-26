import { SfdxCore } from './sfdx-core';

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

export class SfdxQuery {
    public static MAX_QUERY_LIMIT = 1000;

    // Query Custom Application info - they are called TabSet in SOQL
    public static async getCustomApplications(usernameOrAlias: string): Promise<SfdxEntity[]> {
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
    public static async getSetupEntityTypes(usernameOrAlias: string): Promise<string[]> {
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
    public static async getFolders(usernameOrAlias: string): Promise<SfdxFolder[]> {
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
    public static async getPermissions(usernameOrAlias: string): Promise<Map<string, SfdxPermissionSet>> {
        const query = 'SELECT Id,Name,Profile.Name,IsOwnedByProfile FROM PermissionSet ORDER BY Profile.Name, Name';
        const records = await SfdxQuery.doSoqlQuery(usernameOrAlias, query);
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
    public static async getObjectPermissions(usernameOrAlias: string, customObjectTypeName: string): Promise<SfdxObjectPermission[]> {
        const query = `SELECT Id,ParentId,PermissionsCreate,PermissionsDelete,PermissionsEdit,PermissionsModifyAllRecords,PermissionsRead,PermissionsViewAllRecords,SObjectType FROM ObjectPermissions WHERE SObjectType='${customObjectTypeName}' ORDER BY SObjectType`;
        const records = await SfdxQuery.doSoqlQuery(usernameOrAlias, query);
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
    public static async getFieldPermissions(usernameOrAlias: string, customObjectTypeName: string): Promise<SfdxFieldPermission[]> {
        const query = `SELECT Id,ParentId,PermissionsEdit,PermissionsRead,Field FROM FieldPermissions WHERE SobjectType = '${customObjectTypeName}' ORDER BY Field`;
        const records = await SfdxQuery.doSoqlQuery(usernameOrAlias, query);
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
    public static async getSetupEntityAccessForTypes(usernameOrAlias: string, setupEntityTypeNames: string[]): Promise<SfdxSeupEntityAccess[]> {
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

    public static async doSoqlQuery(usernameOrAlias: string, query: string, recordOffset: number = null, recordLimit: number = null): Promise<any[]> {
        const records = [];
        if (!recordLimit) {
            const cmd = `sfdx force:data:soql:query -q \"${query}\" --json -u ${usernameOrAlias}`;
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
                const cmd = `sfdx force:data:soql:query -q \"${currentQuery}\" --json -u ${usernameOrAlias}`;
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
}
