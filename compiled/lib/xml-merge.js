"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs_1 = require("fs");
const utils_1 = require("./utils");
class XmlMerge {
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    static async mergeXmlFiles(sourceXmlFile, destinationXmlFile, ux) {
        let merged;
        const logFilePath = path.join(path.dirname(destinationXmlFile), 'xml-merge.log');
        try {
            // Reset log file
            await utils_1.default.deleteFile(logFilePath);
            if (!(await utils_1.default.pathExists(sourceXmlFile))) {
                await this.logMessage(`Source package does not exist: ${sourceXmlFile}`, logFilePath, ux);
                return;
            }
            const source = await utils_1.default.readObjectFromXmlFile(sourceXmlFile);
            await this.logMessage(`Parsed source package: ${sourceXmlFile}`, logFilePath, ux);
            if (await utils_1.default.pathExists(destinationXmlFile)) {
                const destination = await utils_1.default.readObjectFromXmlFile(destinationXmlFile);
                await this.logMessage(`Parsed destination package: ${destinationXmlFile}`, logFilePath, ux);
                merged = this.mergeObjects(source, destination);
            }
            else {
                await this.logMessage('Destination package does not exist - using source', logFilePath, ux);
                merged = source;
            }
            await utils_1.default.writeObjectToXmlFile(destinationXmlFile, merged);
            await this.logMessage(`Merged package written: ${destinationXmlFile}`, logFilePath, ux);
        }
        catch (err) {
            await this.logMessage(err, logFilePath, ux);
        }
        finally {
            await this.logMessage('Done', logFilePath, ux);
        }
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
        return merged;
    }
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    static async mergeXmlToFile(sourceXml, destinationXmlFile) {
        let merged;
        if (await utils_1.default.pathExists(destinationXmlFile)) {
            const destination = await utils_1.default.readObjectFromXmlFile(destinationXmlFile);
            merged = this.mergeObjects(sourceXml, destination);
        }
        else {
            merged = sourceXml;
        }
        await utils_1.default.writeObjectToXmlFile(destinationXmlFile, merged);
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
        return merged;
    }
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    static getType(pack, name) {
        for (const type of pack.types) {
            if (type.name[0] === name) {
                return type;
            }
        }
        return null;
    }
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
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
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
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