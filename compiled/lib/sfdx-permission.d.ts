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
    static fromXml(filePath: string, json: any): ObjectDetail;
    visibility: string;
    intSharingModel: string;
    extSharingModel: string;
    toXmlObj(): any;
}
export declare class FieldDetail extends MetadataDetail {
    static fromXml(filePath: string, json: any): FieldDetail;
    type: string;
    description: string;
    encryptionScheme: string;
    toXmlObj(): any;
}
export declare abstract class MetaDataPermission extends Named {
    r: boolean;
    abstract toXmlObj(): any;
    toString(): string;
}
export declare class FieldPermission extends MetaDataPermission {
    static fromXml(json: any): FieldPermission;
    u: boolean;
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
    static fromXml(json: any): MetaDataPermission;
    recordType: string;
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
    static fromXMl(json: any): TabPermission;
    private static standardPrefix;
    visibility: string;
    isStandard: boolean;
    private tabVisibilityKind;
    setName(name: string): void;
    toString(): string;
    toXmlObj(): any;
}
export declare class ObjectPermission extends FieldPermission {
    static fromXml(json: any): ObjectPermission;
    c: boolean;
    d: boolean;
    viewAll: boolean;
    modAll: boolean;
    toXmlObj(): any;
    toString(): string;
}
export declare class PermissionSet extends Named {
    static fromXml(filePath: string, json: any): PermissionSet;
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
    toXmlObj(): any;
    getPermissionCollection(metadataName: string): Map<string, MetaDataPermission>;
}
export declare class SfdxPermission {
    static apexClass: string;
    static apexPage: string;
    static customApplication: string;
    static customObject: string;
    static customField: string;
    static customTab: string;
    static permissionSet: string;
    static profile: string;
    static recordType: string;
    static layout: string;
    static defaultPermissionMetaTypes: string[];
    static getPermisionString(permissionSet: Named): string;
}
