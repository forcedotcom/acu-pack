export declare class PackageDirectory {
    path: string;
    default: boolean;
}
export default class SfdxProject {
    private static defaultInstance;
    packageDirectories: PackageDirectory[];
    namespace: string;
    sfdcLoginUrl: string;
    sourceApiVersion: string;
    constructor();
    static default(): Promise<SfdxProject>;
    static deserialize(projectFilePath?: string): Promise<SfdxProject>;
    getDefaultDirectory(): string;
}
