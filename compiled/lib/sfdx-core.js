"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SfdxCore = void 0;
const child_process_1 = require("child_process");
const utils_1 = require("../lib/utils");
const sfdx_project_1 = require("../lib/sfdx-project");
const constants_1 = require("../lib/constants");
const xml_merge_1 = require("./xml-merge");
class SfdxCore {
    static command(cmd) {
        return new Promise((resolve, reject) => {
            child_process_1.exec(cmd, SfdxCore.bufferOptions, (error, stdout) => {
                let response;
                try {
                    if (stdout && String(stdout) !== '') {
                        response = JSON.parse(stdout);
                    }
                }
                catch (err) {
                    /* eslint-disable-next-line no-console */
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
    static async getPackageBase(version = null) {
        return {
            Package: {
                $: {
                    xmlns: constants_1.default.DEFAULT_XML_NAMESPACE
                },
                types: [],
                version: version || (await sfdx_project_1.default.default()).sourceApiVersion
            }
        };
    }
    static async createPackage(packageTypes, version = null) {
        const packageObj = await SfdxCore.getPackageBase(version);
        const typeNames = utils_1.default.sortArray(Array.from(packageTypes.keys()));
        for (const typeName of typeNames) {
            const members = utils_1.default.sortArray(packageTypes.get(typeName));
            packageObj.Package.types.push({
                name: [typeName],
                members
            });
        }
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
        return packageObj;
    }
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    static async writePackageFile(metadataMap, packageFilePath, append, xmlOptions) {
        // Convert into Package format
        const sfdxPackage = await SfdxCore.createPackage(metadataMap);
        if (append) {
            await xml_merge_1.default.mergeXmlToFile(sfdxPackage, packageFilePath);
        }
        else {
            await utils_1.default.writeObjectToXmlFile(packageFilePath, sfdxPackage, xmlOptions);
        }
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