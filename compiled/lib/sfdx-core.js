"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const xml2js = require("xml2js");
const fs_1 = require("fs");
const utils_1 = require("../lib/utils");
class SfdxCore {
    static command(cmd) {
        return new Promise((resolve, reject) => {
            child_process_1.exec(cmd, SfdxCore.bufferOptions, (error, stdout, stderr) => {
                let response;
                try {
                    if (stdout && String(stdout) !== '') {
                        response = JSON.parse(stdout);
                    }
                }
                catch (err) {
                    console.warn(stdout);
                }
                finally {
                    if (!response) {
                        if (error) {
                            reject(error.message);
                        }
                        else {
                            resolve(stdout);
                        }
                    }
                    else {
                        if (response.status !== 0) {
                            reject(response);
                        }
                        else {
                            resolve(response.result);
                        }
                    }
                }
            });
        });
    }
    static getPackageBase(version = null) {
        return {
            Package: {
                $: {
                    xmlns: 'http://soap.sforce.com/2006/04/metadata'
                },
                types: [],
                version: version || '48'
            }
        };
    }
    static createPackage(packageTypes, version = null) {
        const packageObj = SfdxCore.getPackageBase(version);
        const names = utils_1.default.sortArray(Array.from(packageTypes.keys()));
        for (const name of names) {
            const members = utils_1.default.sortArray(packageTypes.get(name));
            packageObj.Package.types.push({
                name,
                members
            });
        }
        return packageObj;
    }
    static async writePackageFile(metadataMap, packageFilePath) {
        // Convert into Package format
        const sfdxPackage = SfdxCore.createPackage(metadataMap);
        await fs_1.promises.writeFile(packageFilePath, new xml2js.Builder().buildObject(sfdxPackage));
    }
    static async fileToJson(filePath) {
        const data = (await fs_1.promises.readFile(filePath)).toString();
        return JSON.parse(data);
    }
    static async jsonToFile(jsonObject, filePath) {
        await fs_1.promises.writeFile(filePath, JSON.stringify(jsonObject, null, SfdxCore.jsonSpaces));
    }
}
exports.SfdxCore = SfdxCore;
SfdxCore.ASTERIX = '*';
SfdxCore.MAIN = 'main';
SfdxCore.DEFAULT = 'default';
SfdxCore.EMAIL_TEMPLATE_XML_NAME = 'EmailTemplate';
SfdxCore.bufferOptions = { env: { NODE_OPTIONS: null }, maxBuffer: 10 * 1024 * 1024 };
SfdxCore.jsonSpaces = 2;
//# sourceMappingURL=sfdx-core.js.map