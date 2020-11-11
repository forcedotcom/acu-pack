export declare class SfdxEntity {
    id: string;
    parentId: string;
    name: string;
}
export declare class SfdxSeupEntityAccess {
    setupEntityId: string;
    setupEntityType: string;
}
export declare class SfdxFolder extends SfdxEntity {
    developerName: string;
    type: string;
}
export declare class SfdxPermissionSet extends SfdxEntity {
    isOwnedByProfile: boolean;
    profileName: string;
}
export declare abstract class SfdxPermission extends SfdxEntity {
    abstract permissionType: string;
    permissionsEdit: boolean;
    permissionsRead: boolean;
}
export declare class SfdxFieldPermission extends SfdxPermission {
    permissionType: string;
    field: string;
}
export declare class SfdxObjectPermission extends SfdxPermission {
    permissionType: string;
    permissionsCreate: boolean;
    permissionsDelete: boolean;
    permissionsModifyAllRecords: boolean;
    permissionsViewAllRecords: boolean;
}
export declare class SfdxCodeCoverage {
    codeCoverage: SfdxCodeCoverageItem[];
    totalCoveredLines: number;
    totalUncoveredLines: number;
    codeCoveragePercent: number;
    constructor();
    calculateCodeCoverage(): void;
}
export declare class SfdxCodeCoverageItem extends SfdxEntity {
    codeCoverage: number;
    coveredLines: number[];
    uncoveredLines: number[];
    constructor();
    getCodeCoveragePercent(): number;
}
export declare class SfdxQuery {
    static MAX_QUERY_LIMIT: number;
    static getCustomApplicationsAsync(usernameOrAlias: string): Promise<SfdxEntity[]>;
    static getSetupEntityTypesAsync(usernameOrAlias: string): Promise<string[]>;
    static getFoldersAsync(usernameOrAlias: string): Promise<SfdxFolder[]>;
    static getPermissionsAsync(usernameOrAlias: string): Promise<Map<string, SfdxPermissionSet>>;
    static getObjectPermissionsAsync(usernameOrAlias: string, customObjectTypeName: string): Promise<SfdxObjectPermission[]>;
    static getFieldPermissionsAsync(usernameOrAlias: string, customObjectTypeName: string): Promise<SfdxFieldPermission[]>;
    static getSetupEntityAccessForTypesAsync(usernameOrAlias: string, setupEntityTypeNames: string[]): Promise<SfdxSeupEntityAccess[]>;
    static doSoqlQueryAsync(usernameOrAlias: string, query: string, recordOffset?: number, recordLimit?: number, isToolingAPIQuery?: boolean): Promise<any[]>;
    static getApexTestClassesAsync(usernameOrAlias: string, namespacePrefixes?: string[]): Promise<SfdxEntity[]>;
    static getCodeCoverageAsync(usernameOrAlias: string): Promise<SfdxCodeCoverage>;
    static waitForRecordCount(usernameOrAlias: string, query: string, recordCount?: number, maxWaitSeconds?: number, sleepMiliseconds?: number): AsyncGenerator<number, void, unknown>;
    static waitForApexTestsAsync(username: string, waitCountMaxSeconds: number, createdDate?: string): AsyncGenerator<number, number, unknown>;
}
