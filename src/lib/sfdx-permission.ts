import path = require('path');
import { SfdxCore } from './sfdx-core';

export abstract class Named {
    protected static getValue(json: any): any {
        const value = json && json instanceof Array
            ? json[0]
            : json;
        return value === 'true' || value === 'false'
            ? value === 'true'
            : value;
    }
    public name: string;
}

export abstract class MetadataDetail extends Named {
    public label: string;
    public abstract toXmlObj(): any;
}

export class ObjectDetail extends MetadataDetail {
    public static fromXml(filePath: string, json: any): ObjectDetail {
        if (!filePath || !json) {
            return null;
        }

        const detail = new ObjectDetail();
        detail.name = path.basename(filePath.split('.')[0]);
        detail.label = this.getValue(json.CustomObject.label);
        detail.intSharingModel = this.getValue(json.CustomObject.sharingModel);
        detail.extSharingModel = this.getValue(json.CustomObject.externalSharingModel);
        detail.visibility = this.getValue(json.CustomObject.visibility);

        return detail;
    }

    public visibility: string;
    public intSharingModel: string;
    public extSharingModel: string;

    public toXmlObj(): any {
        return {
            CustomObject: {
                label: this.label,
                sharingModel: this.intSharingModel,
                externalSharingModel: this.extSharingModel,
                visibility: this.visibility
            }
        };
    }
}

export class FieldDetail extends MetadataDetail {
    public static fromXml(filePath: string, json: any): FieldDetail {
        if (!filePath || !json) {
            return null;
        }

        const objectName = path.parse(path.dirname(path.dirname(filePath))).name;

        const detail = new FieldDetail();
        detail.name = `${objectName}.${this.getValue(json.CustomField.fullName)}`;
        detail.label = this.getValue(json.CustomField.label);
        detail.description = this.getValue(json.CustomField.description);
        detail.type = this.getValue(json.CustomField.type);
        detail.encryptionScheme = this.getValue(json.CustomField.encryptionScheme);

        return detail;
    }
    public type: string;
    public description: string;
    public encryptionScheme: string;

    public toXmlObj(): any {
        return {
            CustomField: {
                label: this.label,
                description: this.description,
                type: this.type,
                encryptionScheme: this.encryptionScheme
            }
        };
    }
}

export abstract class MetaDataPermission extends Named {
    public r: boolean;
    public abstract toXmlObj(): any;

    public toString(): string {
        let result = '';
        if (this.r) {
            result += 'R ';
        }
        return result;
    }
}

export class FieldPermission extends MetaDataPermission {
    public static fromXml(json: any): FieldPermission {
        if (!json) {
            return null;
        }

        const permission = new FieldPermission();
        permission.u = this.getValue(json.editable) || false;
        permission.name = this.getValue(json.field);
        permission.r = this.getValue(json.readable) || false;
        return permission;
    }
    public u: boolean;

    public toXmlObj(): any {
        return {
            editable: this.u,
            field: this.name,
            readable: this.r
        };
    }

    public toString(): string {
        let result = super.toString();
        if (this.u) {
            result += 'U ';
        }
        return result;
    }
}

export class ClassPermission extends MetaDataPermission {
    public static fromXml(json: any): ClassPermission {
        if (!json) {
            return null;
        }

        const permission = new ClassPermission();
        permission.name = this.getValue(json.apexClass);
        permission.r = this.getValue(json.enabled) || false;
        return permission;
    }

    public toXmlObj(): any {
        return {
            apexClass: this.name,
            enabled: this.r
        };
    }
}

export class UserPermission extends MetaDataPermission {
    public static fromXml(json: any): UserPermission {
        if (!json) {
            return null;
        }

        const permission = new UserPermission();
        permission.r = this.getValue(json.enabled) || false;
        permission.name = this.getValue(json.name);
        return permission;
    }

    public toXmlObj(): any {
        return {
            enabled: this.r,
            name: this.name
        };
    }
}

export class PagePermission extends MetaDataPermission {
    public static fromXml(json: any): PagePermission {
        if (!json) {
            return null;
        }

        const permission = new PagePermission();
        permission.name = this.getValue(json.apexPage);
        permission.r = this.getValue(json.enabled) || false;
        return permission;
    }

    public toXmlObj(): any {
        return {
            apexPage: this.name,
            enabled: this.r
        };
    }
}

export abstract class DefaultablePermission extends MetaDataPermission {
    public default: boolean;

    public toString(): string {
        let result = super.toString();
        if (this.default) {
            result += '* ';
        }
        return result;
    }
}

export class RecordTypePermission extends DefaultablePermission {
    public static fromXml(json: any): RecordTypePermission {
        if (!json) {
            return null;
        }

        const permission = new RecordTypePermission();
        permission.default = this.getValue(json.default);
        permission.name = this.getValue(json.recordType);
        permission.r = this.getValue(json.visible) || false;
        return permission;
    }

    public toXmlObj(): any {
        return {
            default: this.default,
            recordType: this.name,
            visible: this.r
        };
    }
}

export class ApplicationPermission extends DefaultablePermission {
    public static fromXml(json: any): ApplicationPermission {
        if (!json) {
            return null;
        }

        const permission = new ApplicationPermission();
        permission.name = this.getValue(json.application);
        permission.default = this.getValue(json.default);
        permission.r = this.getValue(json.visible);
        return permission;
    }

    public toXmlObj(): any {
        return {
            application: this.name,
            default: this.default,
            visible: this.r
        };
    }
}

export class TabPermission extends MetaDataPermission {
    public static fromXMl(json: any): TabPermission {
        if (!json) {
            return null;
        }

        const tabPermission = new TabPermission();
        tabPermission.setName(this.getValue(json.tab));
        tabPermission.visibility = this.getValue(json.visibility);
        return tabPermission;
    }

    private static standardPrefix = 'standard-';

    public visibility: string;
    public isStandard: boolean;

    // @ts-ignore
    private tabVisibilityKind = {
        OFF: 'DefaultOff',
        ON: 'DefaultOn',
        HIDDEN: 'Hidden'
    };

    public setName(name: string): void {
        if (!name) {
            return;
        }
        this.isStandard = name.startsWith(TabPermission.standardPrefix);
        this.name = this.isStandard
            ? name.split(TabPermission.standardPrefix)[1]
            : name;
    }

    public toString(): string {
        let result = super.toString();
        if (this.visibility) {
            switch (this.visibility) {
                case this.tabVisibilityKind.ON:
                    result += 'ON ';
                    break;
                case this.tabVisibilityKind.OFF:
                    result += 'OFF ';
                    break;
                case this.tabVisibilityKind.HIDDEN:
                    result += 'HIDE ';
                    break;
            }
        }
        return result;
    }

    public toXmlObj(): any {
        return {
            tab: this.name,
            visibility: this.visibility
        };
    }
}

export class ObjectPermission extends FieldPermission {
    public static fromXml(json: any): ObjectPermission {
        if (!json) {
            return null;
        }

        const permission = new ObjectPermission();
        permission.c = this.getValue(json.allowCreate);
        permission.d = this.getValue(json.allowDelete);
        permission.u = this.getValue(json.allowEdit);
        permission.r = this.getValue(json.allowRead);
        permission.modAll = this.getValue(json.modifyAllRecords);
        permission.name = this.getValue(json.object);
        permission.viewAll = this.getValue(json.viewAllRecords);

        return permission;
    }

    public c: boolean;
    public d: boolean;
    public viewAll: boolean;
    public modAll: boolean;

    public toXmlObj(): any {
        return {
            allowCreate: this.c,
            allowDelete: this.d,
            allowEdit: this.u,
            allowRead: this.r,
            modifyAllRecords: this.modAll,
            object: this.name,
            viewAllRecords: this.viewAll
        };
    }

    public toString(): string {
        if (this.modAll) {
            return 'All';
        }
        let result = '';
        if (this.c) {
            result += 'C ';
        }
        // put this call here to maintain CRUD letter order
        result += super.toString();
        if (this.d) {
            result += 'D ';
        }
        if (this.viewAll) {
            result += 'V ';
        }
        return result;
    }
}

export class PermissionSet extends Named {
    public static fromXml(filePath: string, json: any): PermissionSet {
        if (!filePath || !json) {
            return null;
        }
        const permSet = new PermissionSet();
        permSet.name = path.basename(filePath.split('.')[0]);
        permSet.isProfile = json.Profile ? true : false;

        const root = json.PermissionSet || json.Profile;

        for (const appPerm of root.applicationVisibilities || []) {
            const appPermission = ApplicationPermission.fromXml(appPerm);
            permSet.applicationVisibilities.set(appPermission.name, appPermission);
        }

        for (const classPerm of root.classAccesses || []) {
            const classPermission = ClassPermission.fromXml(classPerm);
            permSet.classAccesses.set(classPermission.name, classPermission);
        }

        for (const fldPerm of root.fieldPermissions || []) {
            const fieldPermission = FieldPermission.fromXml(fldPerm);
            permSet.fieldPermissions.set(fieldPermission.name, fieldPermission);
        }

        for (const objPerm of root.objectPermissions || []) {
            const objPermission = ObjectPermission.fromXml(objPerm);
            permSet.objectPermissions.set(objPermission.name, objPermission);
        }

        for (const pagePerm of root.pageAccesses || []) {
            const pagePermission = PagePermission.fromXml(pagePerm);
            permSet.pageAccesses.set(pagePermission.name, pagePermission);
        }
        for (const recPerm of root.recordTypeVisibilities || []) {
            const recPermission = RecordTypePermission.fromXml(recPerm);
            permSet.recordTypeVisibilities.set(recPermission.name, recPermission);
        }
        for (const tabPerm of root.tabVisibilities || []) {
            const tabPermission = TabPermission.fromXMl(tabPerm);
            permSet.tabVisibilities.set(tabPermission.name, tabPermission);
        }
        for (const usrPerm of root.userPermissions || []) {
            const userPermission = UserPermission.fromXml(usrPerm);
            permSet.userPermissions.set(userPermission.name, userPermission);
        }
        return permSet;
    }

    public isProfile: boolean;
    public fieldPermissions: Map<string, FieldPermission>;
    public userPermissions: Map<string, UserPermission>;
    public classAccesses: Map<string, ClassPermission>;
    public pageAccesses: Map<string, PagePermission>;
    public recordTypeVisibilities: Map<string, RecordTypePermission>;
    public tabVisibilities: Map<string, TabPermission>;
    public applicationVisibilities: Map<string, ApplicationPermission>;
    public objectPermissions: Map<string, ObjectPermission>;

    constructor() {
        super();
        this.fieldPermissions = new Map<string, FieldPermission>();
        this.userPermissions = new Map<string, UserPermission>();
        this.classAccesses = new Map<string, ClassPermission>();
        this.pageAccesses = new Map<string, PagePermission>();
        this.recordTypeVisibilities = new Map<string, RecordTypePermission>();
        this.tabVisibilities = new Map<string, TabPermission>();
        this.applicationVisibilities = new Map<string, ApplicationPermission>();
        this.objectPermissions = new Map<string, ObjectPermission>();
    }

    public toXmlObj(): any {
        const xmlObj = {
            Profile: {
                $: {
                    xmlns: SfdxCore.DEFAULT_XML_NAMESPACE
                },
                applicationVisibilities: [],
                classAccesses: [],
                fieldPermissions: [],
                objectPermissions: [],
                pageAccesses: [],
                recordTypeVisibilities: [],
                tabVisibilities: [],
                userPermissions: []
            }
        };
        for (const propertyName of Object.keys(xmlObj.Profile)) {
            if (!this[propertyName]) {
                continue;
            }
            for (const perm of this[propertyName].values()) {
                xmlObj.Profile[propertyName].push(perm.toXmlObj());
            }
        }
        return xmlObj;
    }

    public getPermissionCollection(metadataName: string): Map<string, MetaDataPermission> {
        switch (metadataName) {
            case SfdxPermission.apexPage:
                return this.pageAccesses;
            case SfdxPermission.apexClass:
                return this.classAccesses;
            case SfdxPermission.customApplication:
                return this.applicationVisibilities;
            case SfdxPermission.customField:
                return this.fieldPermissions;
            case SfdxPermission.customObject:
                return this.objectPermissions;
            case SfdxPermission.recordType:
                return this.recordTypeVisibilities;
            case SfdxPermission.customTab:
                return this.tabVisibilities;
            default:
                return null;
        }
    }
}

export class SfdxPermission {
    public static apexClass = 'ApexClass';
    public static apexPage = 'ApexPage';
    public static customApplication = 'CustomApplication';
    public static customObject = 'CustomObject';
    public static customField = 'CustomField';
    public static customTab = 'CustomTab';
    public static permissionSet = 'PermissionSet';
    public static profile = 'Profile';
    public static recordType = 'RecordType';

    public static defaultPermissionMetaTypes = [
        SfdxPermission.apexClass,
        SfdxPermission.apexPage,
        SfdxPermission.customApplication,
        SfdxPermission.customObject,
        SfdxPermission.customTab,
        SfdxPermission.permissionSet,
        SfdxPermission.profile
    ];

    public static getPermisionString(permissionSet: Named) {
        let result = '';
        if (permissionSet instanceof ObjectPermission) {
            result += (permissionSet as ObjectPermission).toString();
        } else if (permissionSet instanceof FieldPermission) {
            result += (permissionSet as FieldPermission).toString();
        } else if (permissionSet instanceof TabPermission) {
            result += (permissionSet as TabPermission).toString();
        } else if (permissionSet instanceof RecordTypePermission ||
            permissionSet instanceof ApplicationPermission) {
            result += (permissionSet as DefaultablePermission).toString();
        } else if (permissionSet instanceof UserPermission ||
            permissionSet instanceof ClassPermission ||
            permissionSet instanceof PagePermission) {
            result += (permissionSet as MetaDataPermission).toString();
        }
        return result.length === 0
            ? ''
            : result.trimRight();
    }
}
