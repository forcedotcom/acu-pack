export declare class PackageDirectory {
    path: string;
    default: boolean;
}
export default class SfdxProject {
    static DEFAULT_PROJECT_FILE_NAME: string;
    static DEFAULT_SFDC_LOGIN_URL: string;
    static DEFAULT_PACKAGE_VERSION: string;
    static default(): Promise<SfdxProject>;
    static deserialize(projectFilePath?: string): Promise<SfdxProject>;
    private static defaultInstance;
    packageDirectories: PackageDirectory[];
    namespace: string;
    sfdcLoginUrl: string;
    sourceApiVersion: string;
    constructor();
    getDefaultDirectory(): string;
}
