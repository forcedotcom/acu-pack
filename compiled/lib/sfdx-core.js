"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SfdxCore = void 0;
const child_process_1 = require("child_process");
const utils_1 = require("../lib/utils");
const sfdx_project_1 = require("../lib/sfdx-project");
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
                    xmlns: SfdxCore.DEFAULT_XML_NAMESPACE
                },
                types: [],
                version: version || sfdx_project_1.default.DEFAULT_PACKAGE_VERSION
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
    static async writePackageFile(metadataMap, packageFilePath, eofChar = null) {
        // Convert into Package format
        const sfdxPackage = SfdxCore.createPackage(metadataMap);
        await utils_1.default.writeObjectToXmlFile(packageFilePath, sfdxPackage, eofChar);
    }
}
exports.SfdxCore = SfdxCore;
SfdxCore.DEFAULT_XML_NAMESPACE = 'http://soap.sforce.com/2006/04/metadata';
SfdxCore.ASTERIX = '*';
SfdxCore.MAIN = 'main';
SfdxCore.DEFAULT = 'default';
SfdxCore.EMAIL_TEMPLATE_XML_NAME = 'EmailTemplate';
SfdxCore.bufferOptions = { env: { NODE_OPTIONS: null }, maxBuffer: 10 * 1024 * 1024 };
SfdxCore.jsonSpaces = 2;
//# sourceMappingURL=sfdx-core.js.map