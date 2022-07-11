export declare abstract class XmlPermission {
    protected static getValue(json: any): any;
    abstract toXmlObj(): any;
}
export declare abstract class Named extends XmlPermission {
    name: string;
}
export declare abstract class MetadataDetail extends Named {
    label: string;
}
export declare class ObjectDetail extends MetadataDetail {
    visibility: string;
    intSharingModel: string;
    extSharingModel: string;
    static fromXml(filePath: string, json: any): ObjectDetail;
    toXmlObj(): any;
}
export declare class FieldDetail extends MetadataDetail {
    type: string;
    description: string;
    encryptionScheme: string;
    static fromXml(filePath: string, json: any): FieldDetail;
    toXmlObj(): any;
}
export declare abstract class MetaDataPermission extends Named {
    r: boolean;
    toString(): string;
    abstract toXmlObj(): any;
}
export declare class FieldPermission extends MetaDataPermission {
    u: boolean;
    static fromXml(json: any): FieldPermission;
    toXmlObj(): any;
    toString(): string;
}
export declare class ClassPermission extends MetaDataPermission {
    static fromXml(json: any): ClassPermission;
    toXmlObj(): any;
}
export declare class UserPermission extends MetaDataPermission {
    static fromXml(json: any): UserPermission;
    toXmlObj(): any;
}
export declare class PagePermission extends MetaDataPermission {
    static fromXml(json: any): PagePermission;
    toXmlObj(): any;
}
export declare class LayoutAssignment extends MetaDataPermission {
    recordType: string;
    static fromXml(json: any): MetaDataPermission;
    toXmlObj(): any;
}
export declare abstract class DefaultablePermission extends MetaDataPermission {
    default: boolean;
    toString(): string;
}
export declare class RecordTypePermission extends DefaultablePermission {
    static fromXml(json: any): RecordTypePermission;
    toXmlObj(): any;
}
export declare class ApplicationPermission extends DefaultablePermission {
    static fromXml(json: any): ApplicationPermission;
    toXmlObj(): any;
}
export declare class TabPermission extends MetaDataPermission {
    private static standardPrefix;
    visibility: string;
    isStandard: boolean;
    private tabVisibilityKind;
    static fromXMl(json: any): TabPermission;
    setName(name: string): void;
    toString(): string;
    toXmlObj(): any;
}
export declare class ObjectPermission extends FieldPermission {
    c: boolean;
    d: boolean;
    viewAll: boolean;
    modAll: boolean;
    static fromXml(json: any): ObjectPermission;
    toXmlObj(): any;
    toString(): string;
}
export declare class PermissionSet extends Named {
    isProfile: boolean;
    fieldPermissions: Map<string, FieldPermission>;
    userPermissions: Map<string, UserPermission>;
    classAccesses: Map<string, ClassPermission>;
    pageAccesses: Map<string, PagePermission>;
    recordTypeVisibilities: Map<string, RecordTypePermission>;
    tabVisibilities: Map<string, TabPermission>;
    applicationVisibilities: Map<string, ApplicationPermission>;
    objectPermissions: Map<string, ObjectPermission>;
    layoutAssignments: Map<string, LayoutAssignment>;
    constructor();
    static fromXml(filePath: string, json: any): PermissionSet;
    toXmlObj(): any;
    getPermissionCollection(metadataName: string): Map<string, MetaDataPermission>;
}
export declare class SfdxPermission {
    static readonly apexClass = "ApexClass";
    static readonly apexPage = "ApexPage";
    static readonly customApplication = "CustomApplication";
    static readonly customObject = "CustomObject";
    static readonly customField = "CustomField";
    static readonly customTab = "CustomTab";
    static readonly permissionSet = "PermissionSet";
    static readonly profile = "Profile";
    static readonly recordType = "RecordType";
    static readonly layout = "Layout";
    static defaultPermissionMetaTypes: string[];
    static getPermisionString(permissionSet: Named): string;
}
