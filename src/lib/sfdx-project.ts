import { SfdxProject as BaseProject } from '@salesforce/core';
export class PackageDirectory {
    public path: string = null;
    public default: boolean = false;
}

export default class SfdxProject {
    public static DEFAULT_PROJECT_FILE_NAME = 'sfdx-project.json';
    public static DEFAULT_SFDC_LOGIN_URL = 'https://login.salesforce.com';
    public static DEFAULT_PACKAGE_VERSION = '49.0';

    public static async default(): Promise<SfdxProject> {
        if (!SfdxProject.defaultInstance) {
            SfdxProject.defaultInstance = await SfdxProject.deserialize();
        }
        return SfdxProject.defaultInstance;
    }

    public static async deserialize(projectFilePath?: string): Promise<SfdxProject> {
        const project = await BaseProject.resolve(projectFilePath);
        const projectJson = await project.resolveProjectConfig();
        return Object.assign(new SfdxProject(), projectJson);
    }

    private static defaultInstance: SfdxProject;

    public packageDirectories: PackageDirectory[];
    public namespace: string;
    public sfdcLoginUrl: string;
    public sourceApiVersion: string;

    constructor() {
        this.packageDirectories = [];
        this.namespace = '';
        this.sfdcLoginUrl = SfdxProject.DEFAULT_SFDC_LOGIN_URL;
        this.sourceApiVersion = SfdxProject.DEFAULT_PACKAGE_VERSION;
    }

    public getDefaultDirectory(): string {
        if (!this.packageDirectories) {
            return null;
        }
        for (const packageDirectory of this.packageDirectories) {
            if (packageDirectory.default) {
                return packageDirectory.path;
            }
        }
        return null;
    }
}
