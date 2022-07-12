import path = require('path');
import Constants from './constants';

export abstract class XmlPermission {
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    protected static getValue(json: any): any {
        const value = json && json instanceof Array
            ? json[0]
            : json;
        return value === 'true' || value === 'false'
            ? value === 'true'
            : value;
    }
    public abstract toXmlObj(): any;
}

export abstract class Named extends XmlPermission {
    public name: string;
}

export abstract class MetadataDetail extends Named {
    public label: string;
}

export class ObjectDetail extends MetadataDetail {
    public visibility: string;
    public intSharingModel: string;
    public extSharingModel: string;

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
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
    public type: string;
    public description: string;
    public encryptionScheme: string;

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    public static fromXml(filePath: string, json: any): FieldDetail {
        if (!filePath || !json) {
            return null;
        }

        const objectName = path.parse(path.dirname(path.dirname(filePath))).name;

        const detail = new FieldDetail();
        detail.name = `${objectName}.${this.getValue(json.CustomField.fullName) as string}`;
        detail.label = this.getValue(json.CustomField.label);
        detail.description = this.getValue(json.CustomField.description);
        detail.type = this.getValue(json.CustomField.type);
        detail.encryptionScheme = this.getValue(json.CustomField.encryptionScheme);

        return detail;
    }

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

    public toString(): string {
        let result = '';
        if (this.r) {
            result += 'R ';
        }
        return result;
    }

    public abstract toXmlObj(): any;
}

export class FieldPermission extends MetaDataPermission {
    public u: boolean;

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
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
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
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
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
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
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
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

export class LayoutAssignment extends MetaDataPermission {
    public recordType: string;

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    public static fromXml(json: any): MetaDataPermission {
        if (!json) {
            return null;
        }

        const permission = new LayoutAssignment();
        permission.name = this.getValue(json.layout);
        permission.recordType = this.getValue(json.recordType);
        return permission;
    }
    
    public toXmlObj(): any {
        return {
            layout: this.name,
            recordType: this.recordType
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
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
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
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
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
    private static standardPrefix = 'standard-';

    public visibility: string;
    public isStandard: boolean;

    private tabVisibilityKind = {
        OFF: 'DefaultOff',
        ON: 'DefaultOn',
        HIDDEN: 'Hidden'
    };

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    public static fromXMl(json: any): TabPermission {
        if (!json) {
            return null;
        }

        const tabPermission = new TabPermission();
        tabPermission.setName(this.getValue(json.tab));
        tabPermission.visibility = this.getValue(json.visibility);
        return tabPermission;
    }

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
    public c: boolean;
    public d: boolean;
    public viewAll: boolean;
    public modAll: boolean;

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
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
    
    public isProfile: boolean;
    public fieldPermissions: Map<string, FieldPermission>;
    public userPermissions: Map<string, UserPermission>;
    public classAccesses: Map<string, ClassPermission>;
    public pageAccesses: Map<string, PagePermission>;
    public recordTypeVisibilities: Map<string, RecordTypePermission>;
    public tabVisibilities: Map<string, TabPermission>;
    public applicationVisibilities: Map<string, ApplicationPermission>;
    public objectPermissions: Map<string, ObjectPermission>;
    public layoutAssignments: Map<string, LayoutAssignment>;

    public constructor() {
        super();
        this.fieldPermissions = new Map<string, FieldPermission>();
        this.userPermissions = new Map<string, UserPermission>();
        this.classAccesses = new Map<string, ClassPermission>();
        this.pageAccesses = new Map<string, PagePermission>();
        this.recordTypeVisibilities = new Map<string, RecordTypePermission>();
        this.tabVisibilities = new Map<string, TabPermission>();
        this.applicationVisibilities = new Map<string, ApplicationPermission>();
        this.objectPermissions = new Map<string, ObjectPermission>();
        this.layoutAssignments = new Map<string, LayoutAssignment>();
    }

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
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
        for (const layoutAss of root.layoutAssignments || []) {
            const layoutAssignment = LayoutAssignment.fromXml(layoutAss);
            permSet.layoutAssignments.set(layoutAssignment.name, layoutAss);
        }
        return permSet;
    }

    public toXmlObj(): any {
        const xmlObj = {
            Profile: {
                $: {
                    xmlns: Constants.DEFAULT_XML_NAMESPACE
                },
                applicationVisibilities: [],
                classAccesses: [],
                fieldPermissions: [],
                objectPermissions: [],
                pageAccesses: [],
                recordTypeVisibilities: [],
                tabVisibilities: [],
                userPermissions: [],
                layoutAssignments: []
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
             case SfdxPermission.layout:
                 return this.layoutAssignments;
            default:
                return null;
        }
    }
}

export class SfdxPermission {
    public static readonly apexClass = Constants.SFDX_PERMISSION_APEX_CLASS;
    public static readonly apexPage = Constants.SFDX_PERMISSION_APEX_PAGE;
    public static readonly customApplication = Constants.SFDX_PERMISSION_CUSTOM_APP;
    public static readonly customObject = Constants.SFDX_PERMISSION_CUSTOM_OBJ;
    public static readonly customField = Constants.SFDX_PERMISSION_CUSTOM_FIELD;
    public static readonly customTab = Constants.SFDX_PERMISSION_CUSTOM_TAB;
    public static readonly permissionSet = Constants.SFDX_PERMISSION_SET;
    public static readonly profile = Constants.SFDX_PERMISSION_PROFILE;
    public static readonly recordType = Constants.SFDX_PERMISSION_RECORD_TYPE;
    public static readonly layout = Constants.SFDX_PERMISSION_LAYOUT;

    public static defaultPermissionMetaTypes = [
        SfdxPermission.apexClass,
        SfdxPermission.apexPage,
        SfdxPermission.customApplication,
        SfdxPermission.customObject,
        SfdxPermission.customField,
        SfdxPermission.customTab,
        SfdxPermission.permissionSet,
        SfdxPermission.profile,
        SfdxPermission.recordType,
        SfdxPermission.layout
    ];

    public static getPermisionString(permissionSet: Named): string {
        let result = '';
        if (permissionSet instanceof ObjectPermission) {
            result += (permissionSet).toString();
        } else if (permissionSet instanceof FieldPermission) {
            result += (permissionSet).toString();
        } else if (permissionSet instanceof TabPermission) {
            result += (permissionSet).toString();
        } else if (permissionSet instanceof RecordTypePermission ||
            permissionSet instanceof ApplicationPermission) {
            result += (permissionSet as DefaultablePermission).toString();
        } else if (permissionSet instanceof UserPermission ||
            permissionSet instanceof ClassPermission ||
            permissionSet instanceof LayoutAssignment ||
            permissionSet instanceof PagePermission) {
            result += (permissionSet as MetaDataPermission).toString();
        }
        return result.length === 0
            ? ''
            : result.trimRight();
    }
}
