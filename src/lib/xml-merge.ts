import path = require('path');
import { promises as fs } from 'fs';
import Utils from './utils';

class MergeResult {
    public source: any;
    public destination: any;
    public merged: any;
}

export default class XmlMerge {
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    public static async mergeXmlFiles(sourceXmlFile: string, destinationXmlFile: string, isPackageCompare?: boolean, ux?: any): Promise<any> {
        let results: MergeResult;
        const logFilePath = path.join(path.dirname(destinationXmlFile), 'xml-merge.log');
        try {

            // Reset log file
            await Utils.deleteFile(logFilePath);

            if (!(await Utils.pathExists(sourceXmlFile))) {
                await this.logMessage(`Source package does not exist: ${sourceXmlFile}`, logFilePath, ux);
                return;
            }

            const source = await Utils.readObjectFromXmlFile(sourceXmlFile);
            await this.logMessage(`Parsed source package: ${sourceXmlFile}`, logFilePath, ux);

            if (await Utils.pathExists(destinationXmlFile)) {
                const destination = await Utils.readObjectFromXmlFile(destinationXmlFile);
                await this.logMessage(`Parsed destination package: ${destinationXmlFile}`, logFilePath, ux);
                results = this.mergeObjects(source, destination, isPackageCompare);
            } else if(isPackageCompare) {
                await this.logMessage('Destination package does not exist.', logFilePath, ux);    
                return;
            } else {
                await this.logMessage('Destination package does not exist - using source', logFilePath, ux);
                results.merged = source;
            }
            if(!isPackageCompare) {
                await Utils.writeObjectToXmlFile(destinationXmlFile, results.merged);
                await this.logMessage(`Merged package written: ${destinationXmlFile}`, logFilePath, ux);
            } else {
                await Utils.writeObjectToXmlFile(sourceXmlFile, results.source);
                await Utils.writeObjectToXmlFile(destinationXmlFile, results.destination);
                await this.logMessage(`Packages written: ${sourceXmlFile} & ${destinationXmlFile}`, logFilePath, ux);
            }
        } catch (err) {
            await this.logMessage(err, logFilePath, ux);
        }
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
        return results.merged;
    }

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    public static async mergeXmlToFile(sourceXml: any, destinationXmlFile: string): Promise<any> {
        let merged: any;
        if (await Utils.pathExists(destinationXmlFile)) {
            const destination = await Utils.readObjectFromXmlFile(destinationXmlFile);
            merged = this.mergeObjects(sourceXml, destination).merged;
        } else {
            merged = sourceXml;
        }
        await Utils.writeObjectToXmlFile(destinationXmlFile, merged);
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
        return merged;
    }

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    public static getType(pack: any, name: string): any {
        for (const type of pack.types) {
            if (type.name[0] === name) {
                return type;
            }
        }
        return null;
    }

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    public static async logMessage(message: string, logFile: string, ux?: any): Promise<void> {
        if (typeof message === 'string') {
            await fs.appendFile(logFile, `${message}\r\n`);
        } else {
            await fs.appendFile(logFile, `${JSON.stringify(message)}\r\n`);
        }
        if (ux) {
            ux.log(message);
        }
    }

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    public static mergeObjects(source: any, destination: any, isPackageCompare?: boolean): MergeResult {
        
        const result = new MergeResult();
        result.source = source;
        result.destination = destination;
        result.merged = new Object(destination);

        if (!result.source.Package) {
            result.source['Package'] = {};
        }
        if (!result.source.Package.types) {
            result.source.Package['types'] = [];
        }
        if (!result.merged.Package) {
            result.merged['Package'] = {};
        }
        if (!result.merged.Package.types) {
            result.merged.Package['types'] = [];
        }
        if(!result.merged.Package.version) {
            result.merged.Package['version'] = result.source.Package.version;
        } 
        
        for (const sType of result.source.Package.types) {
            if (!sType.members) {
                continue;
            }
            Utils.sortArray(sType.members);

            const dType: any = this.getType(result.merged.Package, sType.name[0]);
            if (!dType || !dType.members) {
                if(!isPackageCompare) {
                    result.merged.Package.types.push(sType);
                }
                continue;
            }
            
            const pops = [];
            for (const sMem of sType.members) {
                let dMem: string;
                for (const memName of dType.members) {
                    if (sMem === memName) {
                        dMem = memName;
                        break;
                    }
                }
                if (!dMem) {
                    if(!isPackageCompare) {
                        dType.members.push(sMem);
                    }
                } else if(isPackageCompare) {
                    pops.push(dMem);
                }
            }
            // remove all common types here
            for (const pop of pops) {
                sType.members.splice(sType.members.indexOf(pop),1);
                dType.members.splice(dType.members.indexOf(pop),1);
            }
            Utils.sortArray(dType.members);
        }
        
        return result;
    }
}
