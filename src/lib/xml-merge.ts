import Utils from './utils';
import { promises as fs } from 'fs';
import * as xml2js from 'xml2js';
import path = require('path');

export default class XmlMerge {

    public static async mergeXml(sourceXml: string, destinationXml: string, ux?: any): Promise<any> {
        let merged: any;
        const logFilePath = path.join(path.dirname(destinationXml), 'xml-merge.log');
        try {

            // Reset log file
            await Utils.deleteFileAsync(logFilePath);

            if (!(await Utils.pathExistsAsync(sourceXml))) {
                await this.logMessage(`Source package does not exist: ${sourceXml}`, logFilePath, ux);
                return;
            }

            const source = await this.parseXmlFromFile(sourceXml);
            await this.logMessage(`Parsed source package: ${sourceXml}`, logFilePath, ux);

            if (await Utils.pathExistsAsync(destinationXml)) {
                const destination = await this.parseXmlFromFile(destinationXml);
                await this.logMessage(`Parsed destination package: ${destinationXml}`, logFilePath, ux);

                merged = this.mergeObjects(source, destination);
            } else {
                await this.logMessage('Destination package does not exist - using source', logFilePath, ux);
                merged = source;
            }
            await this.writeXmlFile(destinationXml, merged);
            await this.logMessage(`Merged package written: ${destinationXml}`, logFilePath, ux);

        } catch (err) {
            await this.logMessage(err, logFilePath, ux);
        } finally {
            await this.logMessage('Done', logFilePath, ux);
        }
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

    public static async parseXmlFromFile(filePath: string, parserOptions?: any) {
        if (!filePath) {
            return null;
        }
        const xmlString = await fs.readFile(filePath, 'utf8');
        return await (new xml2js.Parser(parserOptions).parseStringPromise((xmlString)));
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

    protected static async writeXmlFile(filename: string, merged: any) {
        const xml = new xml2js.Builder().buildObject(merged);
        await fs.writeFile(filename, xml);
    }
}
