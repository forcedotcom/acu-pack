export declare class SfdxCore {
    static DEFAULT_XML_NAMESPACE: string;
    static ASTERIX: string;
    static MAIN: string;
    static DEFAULT: string;
    static EMAIL_TEMPLATE_XML_NAME: string;
    static bufferOptions: object;
    static jsonSpaces: number;
    static command(cmd: string): Promise<any>;
    static getPackageBase(version?: any): Promise<any>;
    static createPackage(packageTypes: Map<string, string[]>, version?: string): Promise<any>;
    static writePackageFile(metadataMap: Map<string, string[]>, packageFilePath: string, append?: boolean, xmlOptions?: object): Promise<void>;
}
