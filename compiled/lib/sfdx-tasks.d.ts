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
    protected static proFolderPaths: Map<string, string>;
    static describeMetadata(usernameOrAlias: string): Promise<any[]>;
    static executeAnonymousBlock(usernameOrAlias: string, apexFilePath: string, logLevel?: string): Promise<any>;
    static retrievePackage(usernameOrAlias: string, packageFilePath?: string): Promise<any>;
    static initializeProject(projectName: string): Promise<string>;
    static getTypesForPackage(usernameOrAlias: string, describeMetadatas: Set<any>, namespaces?: Set<string>): AsyncGenerator<any, void, void>;
    static listMetadatas(usernameOrAlias: string, metadataTypes: Iterable<string>, namespaces?: Set<string>): Promise<Map<string, string[]>>;
    static listMetadata(usernameOrAlias: string, metadataType: string, namespaces?: Set<string>): AsyncGenerator<any, void, void>;
    static listMetadataInFolder(usernameOrAlias: string, metadataType: string, folderName: string, namespaces?: Set<string>): AsyncGenerator<any, void, void>;
    static describeObject(usernameOrAlias: string, objectName: string): Promise<any>;
    static enqueueApexTests(usernameOrAlias: string, sfdxEntities: SfdxEntity[], shouldSkipCodeCoverage?: boolean): Promise<SfdxJobInfo>;
    static getBulkJobStatus(usernameOrAlias: string, jobInfo: SfdxJobInfo): Promise<SfdxJobInfo>;
    static waitForJob(usernameOrAlias: string, jobInfo: SfdxJobInfo, maxWaitSeconds?: number, sleepMiliseconds?: number): AsyncGenerator<SfdxJobInfo, SfdxJobInfo, void>;
    static getOrgInfo(orgAliasOrUsername: string): Promise<SfdxOrgInfo>;
    static getMapFromSourceTrackingStatus(sourceTrackingStatues: any[]): any;
    static getSourceTrackingStatus(orgAliasOrUsername: string): Promise<any[]>;
    static getConfigValue(configName: string): Promise<string>;
    static setConfigValue(configName: string, configValue: string): Promise<void>;
    static getMaxQueryLimit(): Promise<number>;
    static setMaxQueryLimit(maxQueryLimit: number): Promise<void>;
    static getDefaultOrgAlias(): Promise<string>;
    static setDefaultOrgAlias(orgAlias: string): Promise<void>;
    static getUnsupportedMetadataTypes(): Promise<string[]>;
    private static getFolderSOQLData;
    private static getFolderFullPath;
    private static getJobInfo;
}
