export default class Utils {
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
    static getFilesAsync(folderPath: string, isRecursive?: boolean): any;
    static readFileLinesAsync(filePath: string): AsyncGenerator<any, void, unknown>;
    static pathExistsAsync(pathToCheck: string): Promise<boolean>;
    static getPathStat(pathToCheck: any): Promise<any>;
    static isENOENT(err: any): boolean;
    static mkDirPath(destination: string, hasFileName?: boolean): Promise<void>;
    static copyFile(source: string, destination: string): Promise<void>;
    static sortArray(array: any[]): any[];
    static selectXPath(xml: string, xpaths: string[]): Map<string, string[]>;
    static deleteFileAsync(filePath: string): Promise<boolean>;
    static sleep(sleepMiliseconds?: number): Promise<void>;
    static getFieldValues(records: any[], fieldName?: string, mustHaveValue?: boolean): string[];
    static getFieldValue(record: any, fieldName?: string, mustHaveValue?: boolean): string;
    static unmaskEmail(email: string, mask?: string): string;
    static writeObjectToXml(metadata: any, xmlOptions?: any): string;
    static writeObjectToXmlFile(filePath: string, metadata: any, xmlOptions?: any): Promise<string>;
    static readObjectFromXmlFile(filePath: string, xmlOptions?: any): Promise<any>;
    private static glob;
}
