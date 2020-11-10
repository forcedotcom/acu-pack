export default class XmlMerge {
    static mergeXml(sourceXml: string, destinationXml: string, ux?: any): Promise<any>;
    static getType(pack: any, name: string): any;
    static logMessage(message: string, logFile: string, ux?: any): Promise<void>;
    static parseXmlFromFile(filePath: string, parserOptions?: any): Promise<any>;
    static mergeObjects(source: any, destination: any): any;
    protected static writeXmlFile(filename: string, merged: any): Promise<void>;
}
