declare class MergeResult {
    source: any;
    destination: any;
}
export default class XmlMerge {
    static mergeXmlFiles(sourceXmlFile: string, destinationXmlFile: string, isPackageCompare?: boolean, ux?: any): Promise<any>;
    static mergeXmlToFile(sourceXml: any, destinationXmlFile: string): Promise<any>;
    static getType(pack: any, name: string): any;
    static logMessage(message: string, logFile: string, ux?: any): Promise<void>;
    static mergeObjects(source: any, destination: any, isPackageCompare?: boolean): MergeResult;
}
export {};
