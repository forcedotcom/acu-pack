import { Logger } from '@salesforce/core';
export declare const NO_CONTENT_CODE = 204;
export declare enum LoggerLevel {
    trace = "trace",
    debug = "debug",
    info = "info",
    warn = "warn",
    error = "error",
    fatal = "fatal"
}
export declare enum RestAction {
    GET = "GET",
    PUT = "PUT",
    POST = "POST",
    DELETE = "DELETE",
    PATCH = "PATCH"
}
export declare class RestResult {
    id: string;
    code: number;
    body: any;
    isError: boolean;
    contentType: string;
    isBinary: boolean;
    throw(): Error;
    getContent(): any;
    private getError;
}
export default class Utils {
    static logger: Logger;
    static isJsonEnabled: boolean;
    static TempFilesPath: string;
    static defaultXmlOptions: {
        renderOpts: {
            pretty: boolean;
            indent: string;
            newline: string;
        };
        xmldec: {
            version: string;
            encoding: string;
        };
        eofChar: string;
        encoding: string;
    };
    private static reqUtils;
    private static reqGlob;
    private static glob;
    private static bent;
    static log(logMessage: string, logLevel: string, isJsonEnabled?: boolean): Promise<void>;
    static getFiles(folderPath: string, isRecursive?: boolean): AsyncGenerator<string, void, void>;
    static readFileLines(filePath: string): AsyncGenerator<string, void, void>;
    static readFile(filePath: string, options?: any): Promise<string>;
    static pathExists(pathToCheck: string): Promise<boolean>;
    static getPathStat(pathToCheck: string): Promise<any>;
    static isENOENT(err: any): boolean;
    static mkDirPath(destination: string, hasFileName?: boolean): Promise<void>;
    static copyFile(source: string, destination: string): Promise<void>;
    static sortArray(array: any[]): any[];
    static selectXPath(xml: string, xpaths: string[]): Map<string, string[]>;
    static deleteFile(filePath: string): Promise<boolean>;
    static sleep(sleepMiliseconds?: number): Promise<void>;
    static getFieldValues(records: any[], fieldName?: string, mustHaveValue?: boolean): string[];
    static getFieldValue(record: any, fieldName?: string, mustHaveValue?: boolean): string;
    static unmaskEmail(email: string, mask?: string): string;
    static writeObjectToXml(metadata: any, xmlOptions?: any): string;
    static writeObjectToXmlFile(filePath: string, metadata: any, xmlOptions?: any): Promise<string>;
    static readObjectFromXmlFile(filePath: string, xmlOptions?: any): Promise<any>;
    static setCwd(newCwdPath: string): string;
    static deleteDirectory(dirPath: string): Promise<void>;
    static writeFile(filePath: string, contents: any): Promise<void>;
    static chunkRecords(recordsToChunk: any[], chunkSize: number): any[];
    static getRestResult(action: RestAction, url: string, parameter?: any, headers?: any, validStatusCodes?: []): Promise<RestResult>;
    static isDirectory(filePath: string): Promise<boolean>;
}
