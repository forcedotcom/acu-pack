import { SfdxProject as BaseProject } from '@salesforce/core';
import Constants from './constants';
export class PackageDirectory {
    public path: string = null;
    public default = false;
}

export default class SfdxProject {
    private static defaultInstance: SfdxProject;

    public packageDirectories: PackageDirectory[];
    public namespace: string;
    public sfdcLoginUrl: string;
    public sourceApiVersion: string;

    public constructor() {
        this.packageDirectories = [];
        this.namespace = '';
        this.sfdcLoginUrl = Constants.DEFAULT_SFDC_LOGIN_URL;
        this.sourceApiVersion = Constants.DEFAULT_PACKAGE_VERSION;
    }

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
