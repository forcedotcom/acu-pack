"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs_1 = require("fs");
const utils_1 = require("./utils");
class MergeResult {
}
class XmlMerge {
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    static async mergeXmlFiles(sourceXmlFile, destinationXmlFile, isPackageCompare, ux) {
        let results;
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
                results = this.mergeObjects(source, destination, isPackageCompare);
            }
            else {
                await this.logMessage('Destination package does not exist - using source', logFilePath, ux);
                results.merged = source;
            }
            if (!isPackageCompare) {
                await utils_1.default.writeObjectToXmlFile(destinationXmlFile, results.merged);
                await this.logMessage(`Merged package written: ${destinationXmlFile}`, logFilePath, ux);
            }
            else {
                await utils_1.default.writeObjectToXmlFile(sourceXmlFile, results.source);
                await utils_1.default.writeObjectToXmlFile(destinationXmlFile, results.destination);
                await this.logMessage(`Packages written: ${sourceXmlFile} & ${destinationXmlFile}`, logFilePath, ux);
            }
        }
        catch (err) {
            await this.logMessage(err, logFilePath, ux);
        }
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
        return results.merged;
    }
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    static async mergeXmlToFile(sourceXml, destinationXmlFile) {
        let merged;
        if (await utils_1.default.pathExists(destinationXmlFile)) {
            const destination = await utils_1.default.readObjectFromXmlFile(destinationXmlFile);
            merged = this.mergeObjects(sourceXml, destination).merged;
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
    static mergeObjects(source, destination, isPackageCompare) {
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
        if (!result.merged.Package.version) {
            result.merged.Package['version'] = result.source.Package.version;
        }
        for (const sType of result.source.Package.types) {
            if (!sType.members) {
                continue;
            }
            utils_1.default.sortArray(sType.members);
            const dType = this.getType(result.merged.Package, sType.name[0]);
            if (!dType || !dType.members) {
                if (!isPackageCompare) {
                    result.merged.Package.types.push(sType);
                }
                continue;
            }
            const pops = [];
            for (const sMem of sType.members) {
                let dMem;
                for (const memName of dType.members) {
                    if (sMem === memName) {
                        dMem = memName;
                        break;
                    }
                }
                if (!dMem) {
                    if (!isPackageCompare) {
                        dType.members.push(sMem);
                    }
                }
                else if (isPackageCompare) {
                    pops.push(dMem);
                }
            }
            // remove all common types here
            for (const pop of pops) {
                sType.members.splice(sType.members.indexOf(pop), 1);
                dType.members.splice(dType.members.indexOf(pop), 1);
            }
            utils_1.default.sortArray(dType.members);
        }
        return result;
    }
}
exports.default = XmlMerge;
//# sourceMappingURL=xml-merge.js.map