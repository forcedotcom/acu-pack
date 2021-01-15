import { SfdxEntity } from './sfdx-query';
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
export declare class SfdxTasks {
    static defaultMetaTypes: string[];
    static describeMetadata(usernameOrAlias: string): Promise<any[]>;
    static retrievePackage(usernameOrAlias: string, packageFilePath?: string): Promise<any>;
    static initializeProject(projectName: string): Promise<string>;
    static getTypesForPackage(usernameOrAlias: string, describeMetadatas: Set<any>, namespaces?: Set<string>): AsyncGenerator<{
        name: any;
        members: any[];
    }, void, unknown>;
    static listMetadatas(usernameOrAlias: string, metadataTypes: Iterable<string>, namespaces?: Set<string>): Promise<Map<string, string[]>>;
    static listMetadata(usernameOrAlias: string, metadataType: string, namespaces?: Set<string>): AsyncGenerator<any, void, unknown>;
    static listMetadataInFolder(usernameOrAlias: string, metadataType: string, folderName: string, namespaces?: Set<string>): AsyncGenerator<any, void, unknown>;
    static describeObject(usernameOrAlias: string, objectName: string): Promise<any>;
    static enqueueApexTests(usernameOrAlias: string, sfdxEntities: SfdxEntity[], shouldSkipCodeCoverage?: boolean): Promise<SfdxJobInfo>;
    static getBulkJobStatus(usernameOrAlias: string, jobInfo: SfdxJobInfo): Promise<SfdxJobInfo>;
    static waitForJob(usernameOrAlias: string, jobInfo: SfdxJobInfo, maxWaitSeconds?: number, sleepMiliseconds?: number): AsyncGenerator<SfdxJobInfo, SfdxJobInfo, unknown>;
    static getOrgInfo(orgAliasOrUsername: string): Promise<SfdxOrgInfo>;
    protected static _folderPaths: Map<string, string>;
    private static getFolderSOQLData;
    private static getFolderFullPath;
    private static getJobInfo;
}
