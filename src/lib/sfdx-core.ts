import { exec } from 'child_process';
import Utils from '../lib/utils';
import SfdxProject from '../lib/sfdx-project';
import Constants from '../lib/constants';
import XmlMerge from './xml-merge';

export class SfdxCore {
    public static ASTERIX = '*';
    public static MAIN = 'main';
    public static DEFAULT = 'default';
    public static EMAIL_TEMPLATE_XML_NAME = 'EmailTemplate';

    public static bufferOptions = { env: process.env, maxBuffer: 10 * 1024 * 1024 };
    public static jsonSpaces = 2;

    public static command(cmd: string): Promise<any> {
        return new Promise((resolve, reject) => {
            exec(cmd, SfdxCore.bufferOptions, (error: any, stdout: any) => {
                let response: any;
                try {
                    if (stdout && String(stdout) !== '') {
                        response = JSON.parse(stdout);
                    }
                } catch (err) {
                    /* eslint-disable-next-line no-console */
                    console.warn(stdout);
                } finally {
                    if (!response) {
                        if (error) {
                            reject(error.message);
                        } else {
                            resolve(stdout);
                        }
                    } else {
                        if (response.status !== 0) {
                            reject(response);
                        } else {
                            resolve(response.result);
                        }
                    }
                }
            });
        });
    }

    public static async getPackageBase(version = null): Promise<any> {
        return {
            Package: {
                $: {
                    xmlns: Constants.DEFAULT_XML_NAMESPACE
                },
                types: [],
                version: version || (await SfdxProject.default()).sourceApiVersion
            }
        };
    }

    public static async createPackage(packageTypes: Map<string, string[]>, version: string = null): Promise<any> {
        const packageObj = await SfdxCore.getPackageBase(version);

        const typeNames = Utils.sortArray(Array.from(packageTypes.keys()));
        for (const typeName of typeNames) {
            const members = Utils.sortArray(packageTypes.get(typeName));
            packageObj.Package.types.push({
                name: [typeName],
                members
            });
        }
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
        return packageObj;
    }

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    public static minifyPackage(packageObj: any): any {
        if(!packageObj) {
            return null;
        }
        const popIndexes = [];
        let typeIndex = 0;
        for (const sType of packageObj.Package.types) {
            if(sType?.members) {
                const memPopIndexes = [];
                let memIndex=0;
                for(const member of sType.members) {
                    if(!member || member === '') {
                        memPopIndexes.push(memIndex);
                    }
                    memIndex++
                }
                while(memPopIndexes.length) {
                    sType.members.splice(memPopIndexes.pop(),1);
                }    
            }
            if (!sType?.members || sType.members.length === 0) {
                popIndexes.push(typeIndex);
            }
            typeIndex++;
        }
        while(popIndexes.length) {
            packageObj.Package.types.splice(popIndexes.pop(),1);
        }
        return packageObj;
    }

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    public static async writePackageFile(metadataMap: Map<string, string[]>, packageFilePath: string, append?: boolean, xmlOptions?: any): Promise<void> {
        // Convert into Package format
        const sfdxPackage = await SfdxCore.createPackage(metadataMap);
        if (append) {
            await XmlMerge.mergeXmlToFile(sfdxPackage, packageFilePath);
        } else {
            await Utils.writeObjectToXmlFile(packageFilePath, sfdxPackage, xmlOptions);
        }
    }
}
