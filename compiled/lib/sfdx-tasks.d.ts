import { PackageOptions } from '../lib/package-options';
import { SfdxEntity } from './sfdx-query';
import { XPathOptions } from '../lib/xpath-options';
export declare class SfdxJobInfo {
    id: string;
    batchId: string;
    state: string;
    createdDate: string;
    statusCount: number;
    maxStatusCount: number;
    constructor();
    isDone(): boolean;
}
export declare class SfdxOrgInfo {
    username: string;
    id: string;
    connectedStatus: string;
    accessToken: string;
    instanceUrl: string;
    clientId: string;
    alias: string;
    constructor(result?: any);
}
export declare class SfdxResult {
    id: string;
    success: boolean;
    errors: string[];
    constructor(result?: any);
}
export declare class SfdxTasks {
    static describeMetadata(usernameOrAlias: string): Promise<any[]>;
    static retrievePackage(usernameOrAlias: string, packageFilePath?: string): Promise<any>;
    static initializeProject(projectName: string): Promise<string>;
    static getTypesForPackage(usernameOrAlias: string, describeMetadatas: Set<any>, namespaces?: Set<string>): AsyncGenerator<{
        name: any;
        members: any[];
    }, void, unknown>;
    static listMetadatas(usernameOrAlias: string, metadataTypes: Set<string>, namespaces?: Set<string>): Promise<Map<string, string[]>>;
    static listMetadata(usernameOrAlias: string, metadataType: string, namespaces?: Set<string>): AsyncGenerator<any, void, unknown>;
    static listMetadataInFolder(usernameOrAlias: string, metadataType: string, folderName: string, namespaces?: Set<string>): AsyncGenerator<any, void, unknown>;
    static getPackageOptionsAsync(optionsPath: string): Promise<PackageOptions>;
    static describeObject(usernameOrAlias: string, objectName: string): Promise<any>;
    static getXPathOptionsAsync(optionsPath: string): Promise<XPathOptions>;
    static enqueueApexTestsAsync(usernameOrAlias: string, sfdxEntities: SfdxEntity[], shouldSkipCodeCoverage?: boolean): Promise<SfdxJobInfo>;
    static getBulkJobStatusAsync(usernameOrAlias: string, jobInfo: SfdxJobInfo): Promise<SfdxJobInfo>;
    static waitForJobAsync(usernameOrAlias: string, jobInfo: SfdxJobInfo, maxWaitSeconds?: number, sleepMiliseconds?: number): AsyncGenerator<SfdxJobInfo, SfdxJobInfo, unknown>;
    static getOrgInfo(orgAliasOrUsername: string): Promise<SfdxOrgInfo>;
    static deleteRecordById(orgAliasOrUsername: string, metaDataType: string, recordId: string, isToolingApi?: boolean): Promise<SfdxResult>;
    static deleteRecordsByIds(orgAliasOrUsername: string, metaDataType: string, records: any[], recordIdField?: string, isToolingApi?: boolean): AsyncGenerator<SfdxResult, any, unknown>;
    protected static _folderPaths: Map<string, string>;
    private static getFolderSOQLDataAsync;
    private static getFolderFullPath;
    private static getJobInfo;
}
