"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const fs_1 = require("fs");
const path = require("path");
class XmlMerge {
    static async mergeXml(sourceXml, destinationXml, ux) {
        let merged;
        const logFilePath = path.join(path.dirname(destinationXml), 'xml-merge.log');
        try {
            // Reset log file
            await utils_1.default.deleteFile(logFilePath);
            if (!(await utils_1.default.pathExists(sourceXml))) {
                await this.logMessage(`Source package does not exist: ${sourceXml}`, logFilePath, ux);
                return;
            }
            const source = await utils_1.default.readObjectFromXmlFile(sourceXml);
            await this.logMessage(`Parsed source package: ${sourceXml}`, logFilePath, ux);
            if (await utils_1.default.pathExists(destinationXml)) {
                const destination = await utils_1.default.readObjectFromXmlFile(destinationXml);
                await this.logMessage(`Parsed destination package: ${destinationXml}`, logFilePath, ux);
                merged = this.mergeObjects(source, destination);
            }
            else {
                await this.logMessage('Destination package does not exist - using source', logFilePath, ux);
                merged = source;
            }
            await utils_1.default.writeObjectToXmlFile(destinationXml, merged);
            await this.logMessage(`Merged package written: ${destinationXml}`, logFilePath, ux);
        }
        catch (err) {
            await this.logMessage(err, logFilePath, ux);
        }
        finally {
            await this.logMessage('Done', logFilePath, ux);
        }
        return merged;
    }
    static getType(pack, name) {
        for (const type of pack.types) {
            if (type.name[0] === name) {
                return type;
            }
        }
        return null;
    }
    static async logMessage(message, logFile, ux) {
        if (typeof message === 'string') {
            await fs_1.promises.appendFile(logFile, `${message}\r\n`);
        }
        else {
            await fs_1.promises.appendFile(logFile, `${JSON.stringify(message)}\r\n`);
        }
        if (ux) {
            ux.log(message);
        }
    }
    static mergeObjects(source, destination) {
        if (!source.Package) {
            source['Package'] = {};
        }
        if (!source.Package.types) {
            source.Package['types'] = [];
        }
        const merged = new Object(destination);
        if (!merged.Package) {
            merged['Package'] = {};
        }
        if (!merged.Package.types) {
            merged.Package['types'] = [];
        }
        for (const sType of source.Package.types) {
            const dType = this.getType(merged.Package, sType.name[0]);
            if (!dType) {
                merged.Package.types.push(sType);
                continue;
            }
            if (!sType.members) {
                continue;
            }
            if (!dType.members) {
                dType.members = sType.members;
            }
            else {
                for (const sMem of sType.members) {
                    let dMem;
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
exports.default = XmlMerge;
//# sourceMappingURL=xml-merge.js.map