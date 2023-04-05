/// <reference types="node" />
export declare class SfdxCore {
    static ASTERIX: string;
    static MAIN: string;
    static DEFAULT: string;
    static EMAIL_TEMPLATE_XML_NAME: string;
    static bufferOptions: {
        env: NodeJS.ProcessEnv;
        maxBuffer: number;
    };
    static jsonSpaces: number;
    static command(cmd: string): Promise<any>;
    static getPackageBase(version?: any): Promise<any>;
    static createPackage(packageTypes: Map<string, string[]>, version?: string): Promise<any>;
    static minifyPackage(packageObj: any): any;
    static writePackageFile(metadataMap: Map<string, string[]>, packageFilePath: string, append?: boolean, xmlOptions?: any): Promise<void>;
}
