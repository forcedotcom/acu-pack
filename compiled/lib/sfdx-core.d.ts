export declare class SfdxCore {
    static DEFAULT_XML_NAMESPACE: string;
    static DEFAULT_PACKAGE_VERSION: string;
    static DEFAULT_PROJECT_FILE_NAME: string;
    static ASTERIX: string;
    static MAIN: string;
    static DEFAULT: string;
    static EMAIL_TEMPLATE_XML_NAME: string;
    static bufferOptions: object;
    static jsonSpaces: number;
    static command(cmd: string): Promise<any>;
    static getPackageBase(version?: any): {
        Package: {
            $: {
                xmlns: string;
            };
            types: any[];
            version: any;
        };
    };
    static createPackage(packageTypes: Map<string, string[]>, version?: string): any;
    static writePackageFile(metadataMap: Map<string, string[]>, packageFilePath: string, eofChar?: any): Promise<void>;
    static getProjectInfo(): Promise<any>;
}
