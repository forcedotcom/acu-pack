import { UX } from '@salesforce/command';
export declare class ProfileDownload {
    orgAlias: string;
    profileList: string[];
    profileIDMap: Map<string, string>;
    rootDir: string;
    ux: UX;
    static processMissingObjectPermissions(objectData: any, includedObjects: string[]): Promise<Map<string, any>>;
    static processMissingFieldPermissions(fielddata: any): Promise<any[]>;
    static writeProfileToXML(profileMetadata: any, filePath: string): Promise<void>;
    static checkOrgProfiles(orgName: string): Promise<Map<string, string>>;
    private static objPermissionStructure;
    private static fieldPermissionStructure;
    profileFilePath: Map<string, string>;
    constructor(orgAlias: string, profileList: string[], profileIDMap: Map<string, string>, rootDir: string, ux: UX);
    downloadPermissions(): Promise<Map<string, string>>;
    getProfileMetaData(orgAlias: string, profileName: string): Promise<void>;
}
