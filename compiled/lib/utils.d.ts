export default class Utils {
    static getFilesAsync(folderPath: string, isRecursive?: boolean): any;
    static readFileAsync(filePath: string): AsyncGenerator<any, void, unknown>;
    static pathExistsAsync(pathToCheck: string): Promise<boolean>;
    static getPathStat(pathToCheck: any): Promise<any>;
    static isENOENT(err: any): boolean;
    static copyFile(source: string, destination: string): Promise<void>;
    static sortArray(array: any[]): any[];
    static selectXPath(xml: string, xpaths: string[]): Map<string, string[]>;
    static deleteFileAsync(filePath: string): Promise<void>;
    static sleep(sleepMiliseconds?: number): Promise<void>;
    static getFieldValues(records: any[], fieldName?: string, mustHaveValue?: boolean): string[];
    static getFieldValue(record: any, fieldName?: string, mustHaveValue?: boolean): string;
    static unmaskEmail(email: string, mask?: string): string;
    private static glob;
}
