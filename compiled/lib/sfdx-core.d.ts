export declare class SfdxCore {
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
    static writePackageFile(metadataMap: Map<string, string[]>, packageFilePath: string): Promise<void>;
    static fileToJson<T>(filePath: string): Promise<T>;
    static jsonToFile(jsonObject: object, filePath: string): Promise<void>;
}
