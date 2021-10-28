import { Logger } from '@salesforce/core';
export declare enum LoggerLevel {
    trace = "trace",
    debug = "debug",
    info = "info",
    warn = "warn",
    error = "error",
    fatal = "fatal"
}
export default class Utils {
    static logger: Logger;
    static isJsonEnabled: boolean;
    static _tempFilesPath: string;
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
    static log(logMessage: string, logLevel: string, isJsonEnabled?: boolean): Promise<void>;
    static getFiles(folderPath: string, isRecursive?: boolean): any;
    static readFileLines(filePath: string): AsyncGenerator<any, void, unknown>;
    static readFile(filePath: string, options?: any): Promise<string>;
    static pathExists(pathToCheck: string): Promise<boolean>;
    static getPathStat(pathToCheck: any): Promise<any>;
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
    private static glob;
}
