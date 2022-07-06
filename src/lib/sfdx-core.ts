import { exec } from 'child_process';
import Utils from '../lib/utils';
import SfdxProject from '../lib/sfdx-project';
import XmlMerge from './xml-merge';
import Constants from '../lib/constants';

export class SfdxCore {
    public static ASTERIX: string = '*';
    public static MAIN: string = 'main';
    public static DEFAULT: string = 'default';
    public static EMAIL_TEMPLATE_XML_NAME: string = 'EmailTemplate';

    public static bufferOptions: object = { env: { NODE_OPTIONS: null }, maxBuffer: 10 * 1024 * 1024 };
    public static jsonSpaces: number = 2;

    public static command(cmd: string): Promise<any> {
        return new Promise((resolve, reject) => {
            exec(cmd, SfdxCore.bufferOptions, (error: any, stdout: any, stderr: any) => {
                let response: any;
                try {
                    if (stdout && String(stdout) !== '') {
                        response = JSON.parse(stdout);
                    }
                } catch (err) {
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
        return packageObj;
    }

    public static async writePackageFile(metadataMap: Map<string, string[]>, packageFilePath: string, append?: boolean, xmlOptions?: object): Promise<void> {
        // Convert into Package format
        const sfdxPackage = await SfdxCore.createPackage(metadataMap);
        if (append) {
            await XmlMerge.mergeXmlToFile(sfdxPackage, packageFilePath);
        } else {
            await Utils.writeObjectToXmlFile(packageFilePath, sfdxPackage, xmlOptions);
        }
    }
}
