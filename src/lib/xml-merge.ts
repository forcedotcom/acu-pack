import Utils from './utils';
import { promises as fs } from 'fs';
import path = require('path');

export default class XmlMerge {

    public static async mergeXmlFiles(sourceXmlFile: string, destinationXmlFile: string, ux?: any): Promise<any> {
        let merged: any;
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

                merged = this.mergeObjects(source, destination);
            } else {
                await this.logMessage('Destination package does not exist - using source', logFilePath, ux);
                merged = source;
            }
            await Utils.writeObjectToXmlFile(destinationXmlFile, merged);
            await this.logMessage(`Merged package written: ${destinationXmlFile}`, logFilePath, ux);

        } catch (err) {
            await this.logMessage(err, logFilePath, ux);
        } finally {
            await this.logMessage('Done', logFilePath, ux);
        }
        return merged;
    }

    public static async mergeXmlToFile(sourceXml: any, destinationXmlFile: string): Promise<any> {
        let merged: any;
        if (await Utils.pathExists(destinationXmlFile)) {
            const destination = await Utils.readObjectFromXmlFile(destinationXmlFile);
            merged = this.mergeObjects(sourceXml, destination);
        } else {
            merged = sourceXml;
        }
        await Utils.writeObjectToXmlFile(destinationXmlFile, merged);
        return merged;
    }

    public static getType(pack: any, name: string): any {
        for (const type of pack.types) {
            if (type.name[0] === name) {
                return type;
            }
        }
        return null;
    }

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

    public static mergeObjects(source: any, destination: any): any {
        if (!source.Package) {
            source['Package'] = {};
        }
        if (!source.Package.types) {
            source.Package['types'] = [];
        }

        const merged: any = new Object(destination);
        if (!merged.Package) {
            merged['Package'] = {};
        }
        if (!merged.Package.types) {
            merged.Package['types'] = [];
        }
        for (const sType of source.Package.types) {
            const dType: any = this.getType(merged.Package, sType.name[0]);
            if (!dType) {
                merged.Package.types.push(sType);
                continue;
            }
            if (!sType.members) {
                continue;
            }
            if (!dType.members) {
                dType.members = sType.members;
            } else {
                for (const sMem of sType.members) {
                    let dMem: string;
                    for (const memName of dType.members) {
                        if (sMem === memName) {
                            dMem = memName;
                            break;
                        }
                    }
                    if (!dMem) {
                        dType.members.push(sMem);
                    }
                }
            }
            dType.members.sort();
        }
        merged.Package.version = source.Package.version;
        return merged;
    }
}
