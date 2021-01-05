import { exec } from 'child_process';
import Utils from '../lib/utils';

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
                let response;
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

    public static getPackageBase(version = null) {
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

    public static createPackage(packageTypes: Map<string, string[]>, version: string = null): any {
        const packageObj = SfdxCore.getPackageBase(version);

        const names = Utils.sortArray(Array.from(packageTypes.keys()));
        for (const name of names) {
            const members = Utils.sortArray(packageTypes.get(name));
            packageObj.Package.types.push({
                name,
                members
            });
        }
        return packageObj;
    }

    public static async writePackageFile(metadataMap: Map<string, string[]>, packageFilePath: string, eofChar = null): Promise<void> {
        // Convert into Package format
        const sfdxPackage = SfdxCore.createPackage(metadataMap);
        await Utils.writeObjectToXmlFile(packageFilePath, sfdxPackage, eofChar);
    }
}
