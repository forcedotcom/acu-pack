import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
declare abstract class MetadataDetail {
    label: string;
}
declare class ObjectDetail extends MetadataDetail {
    visibility: string;
    intSharingModel: string;
    extSharingModel: string;
}
declare class FieldDetail extends MetadataDetail {
    type: string;
    description: string;
    encryptionScheme: string;
}
declare abstract class NamedPermission {
    name: string;
}
declare abstract class ReadPermission extends NamedPermission {
    r: boolean;
}
declare class FieldPermission extends ReadPermission {
    u: boolean;
}
declare class ClassPermission extends ReadPermission {
}
declare class UserPermission extends ReadPermission {
}
declare class PagePermission extends ReadPermission {
}
declare abstract class DefaultablePermission extends ReadPermission {
    default: boolean;
}
declare class RecordTypePermission extends DefaultablePermission {
}
declare class ApplicationPermission extends DefaultablePermission {
}
declare class TabPermission extends ReadPermission {
    visibility: string;
}
declare class ObjectPermission extends FieldPermission {
    c: boolean;
    d: boolean;
    viewAll: boolean;
    modAll: boolean;
}
declare class PermissionSet {
    isProfile: boolean;
    fieldPermissions: Map<string, FieldPermission>;
    userPermissions: Map<string, UserPermission>;
    classAccesses: Map<string, ClassPermission>;
    pageAccesses: Map<string, PagePermission>;
    recordTypeAccesses: Map<string, RecordTypePermission>;
    tabVisibilities: Map<string, TabPermission>;
    applicationVisibilities: Map<string, ApplicationPermission>;
    objectPermissions: Map<string, ObjectPermission>;
}
export default class Permissions extends CommandBase {
    static defaultSourceFolder: string;
    static defaultReportPath: string;
    static defaultMetadataFolders: string[];
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        source: flags.Discriminated<flags.Option<string>>;
        report: flags.Discriminated<flags.Option<string>>;
        folders: flags.Discriminated<flags.Option<string>>;
    };
    protected static requiresProject: boolean;
    protected defaultReportHeaderName: string;
    protected objectMetadata: Map<string, ObjectDetail>;
    protected fieldMetadata: Map<string, FieldDetail>;
    protected permissions: Map<string, PermissionSet>;
    protected reportHeaders: string[];
    run(): Promise<void>;
    protected buildSheet(permCollectionPropertyName: string, metadataDetails?: Map<string, MetadataDetail>): string[][];
    protected getPermisionString(permissionSet: NamedPermission): string;
    protected getObjectDetails(name: string): ObjectDetail;
    protected getFieldDetails(name: string): FieldDetail;
    protected processObjectMeta(filePath: string, json: any): void;
    protected processFieldMeta(filePath: string, json: any): void;
    protected processPermissionSetMeta(filePath: string, json: any): void;
    private getValue;
}
export {};
