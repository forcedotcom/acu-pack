import { UX } from '@salesforce/command';
import { Connection } from 'jsforce';
export declare class ProfileDownload {
    sfdxCon: Connection;
    orgAlias: string;
    profileList: string[];
    profileIDMap: Map<string, string>;
    rootDir: string;
    ux: UX;
    profileFilePath: Map<string, string>;
    constructor(sfdxCon: Connection, orgAlias: string, profileList: string[], profileIDMap: Map<string, string>, rootDir: string, ux: UX);
    static processMissingObjectPermissions(objectData: any[], includedObjects: string[]): Map<string, any>;
    static processMissingFieldPermissions(fielddata: any[]): any[];
    static writeProfileToXML(profileMetadata: any, filePath: string): Promise<void>;
    static checkOrgProfiles(orgName: string): Promise<Map<string, string>>;
    private static objPermissionStructure;
    private static fieldPermissionStructure;
    downloadPermissions(): Promise<Map<string, string>>;
    retrieveProfileMetaData(profileName: string): Promise<any>;
    getProfileMetaData(profileName: string): Promise<void>;
}
