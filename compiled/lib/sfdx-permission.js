"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const sfdx_core_1 = require("./sfdx-core");
class Named {
    static getValue(json) {
        const value = json && json instanceof Array
            ? json[0]
            : json;
        return value === 'true' || value === 'false'
            ? value === 'true'
            : value;
    }
}
exports.Named = Named;
class MetadataDetail extends Named {
}
exports.MetadataDetail = MetadataDetail;
class ObjectDetail extends MetadataDetail {
    static fromXml(filePath, json) {
        const detail = new ObjectDetail();
        detail.name = path.basename(filePath.split('.')[0]);
        detail.label = this.getValue(json.CustomObject.label);
        detail.intSharingModel = this.getValue(json.CustomObject.sharingModel);
        detail.extSharingModel = this.getValue(json.CustomObject.externalSharingModel);
        detail.visibility = this.getValue(json.CustomObject.visibility);
        return detail;
    }
    toXmlObj() {
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
exports.ObjectDetail = ObjectDetail;
class FieldDetail extends MetadataDetail {
    static fromXml(filePath, json) {
        const objectName = path.parse(path.dirname(path.dirname(filePath))).name;
        const detail = new FieldDetail();
        detail.name = `${objectName}.${path.basename(filePath.split('.')[0])}`;
        detail.label = this.getValue(json.CustomField.label);
        detail.description = this.getValue(json.CustomField.description);
        detail.type = this.getValue(json.CustomField.type);
        detail.encryptionScheme = this.getValue(json.CustomField.encryptionScheme);
        return detail;
    }
    toXmlObj() {
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
exports.FieldDetail = FieldDetail;
class MetaDataPermission extends Named {
    toString() {
        let result = '';
        if (this.r) {
            result += 'R ';
        }
        return result;
    }
}
exports.MetaDataPermission = MetaDataPermission;
class FieldPermission extends MetaDataPermission {
    static fromXml(json) {
        const permission = new FieldPermission();
        permission.u = this.getValue(json.editable) || false;
        permission.name = this.getValue(json.field);
        permission.r = this.getValue(json.readable) || false;
        return permission;
    }
    toXmlObj() {
        return {
            editable: this.u,
            field: this.name,
            readable: this.r
        };
    }
    toString() {
        let result = super.toString();
        if (this.u) {
            result += 'U ';
        }
        return result;
    }
}
exports.FieldPermission = FieldPermission;
class ClassPermission extends MetaDataPermission {
    static fromXml(json) {
        const permission = new ClassPermission();
        permission.name = this.getValue(json.apexClass);
        permission.r = this.getValue(json.enabled) || false;
        return permission;
    }
    toXmlObj() {
        return {
            apexClass: this.name,
            enabled: this.r
        };
    }
}
exports.ClassPermission = ClassPermission;
class UserPermission extends MetaDataPermission {
    static fromXml(json) {
        const permission = new UserPermission();
        permission.r = this.getValue(json.enabled) || false;
        permission.name = this.getValue(json.name);
        return permission;
    }
    toXmlObj() {
        return {
            enabled: this.r,
            name: this.name
        };
    }
}
exports.UserPermission = UserPermission;
class PagePermission extends MetaDataPermission {
    static fromXml(json) {
        const permission = new PagePermission();
        permission.name = this.getValue(json.apexPage);
        permission.r = this.getValue(json.enabled) || false;
        return permission;
    }
    toXmlObj() {
        return {
            apexPage: this.name,
            enabled: this.r
        };
    }
}
exports.PagePermission = PagePermission;
class DefaultablePermission extends MetaDataPermission {
    toString() {
        let result = super.toString();
        if (this.default) {
            result += '* ';
        }
        return result;
    }
}
exports.DefaultablePermission = DefaultablePermission;
class RecordTypePermission extends DefaultablePermission {
    static fromXml(json) {
        const permission = new RecordTypePermission();
        permission.default = this.getValue(json.default);
        permission.name = this.getValue(json.recordType);
        permission.r = this.getValue(json.visible) || false;
        return permission;
    }
    toXmlObj() {
        return {
            default: this.default,
            recordType: this.name,
            visible: this.r
        };
    }
}
exports.RecordTypePermission = RecordTypePermission;
class ApplicationPermission extends DefaultablePermission {
    static fromXml(json) {
        const permission = new ApplicationPermission();
        permission.name = this.getValue(json.application);
        permission.default = this.getValue(json.default);
        permission.r = this.getValue(json.visible);
        return permission;
    }
    toXmlObj() {
        return {
            application: this.name,
            default: this.default,
            visible: this.r
        };
    }
}
exports.ApplicationPermission = ApplicationPermission;
class TabPermission extends MetaDataPermission {
    constructor() {
        super(...arguments);
        // @ts-ignore
        this.tabVisibilityKind = {
            OFF: 'DefaultOff',
            ON: 'DefaultOn',
            HIDDEN: 'Hidden'
        };
    }
    static fromXMl(json) {
        const tabPermission = new TabPermission();
        tabPermission.setName(this.getValue(json.tab));
        tabPermission.visibility = this.getValue(json.visibility);
        return tabPermission;
    }
    setName(name) {
        if (!name) {
            return;
        }
        this.isStandard = name.startsWith(TabPermission.standardPrefix);
        this.name = this.isStandard
            ? name.split(TabPermission.standardPrefix)[1]
            : name;
    }
    toString() {
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
    toXmlObj() {
        return {
            tab: this.name,
            visibility: this.r
        };
    }
}
exports.TabPermission = TabPermission;
TabPermission.standardPrefix = 'standard-';
class ObjectPermission extends FieldPermission {
    static fromXml(json) {
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
    toXmlObj() {
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
    toString() {
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
exports.ObjectPermission = ObjectPermission;
class PermissionSet extends Named {
    constructor() {
        super();
        this.fieldPermissions = new Map();
        this.userPermissions = new Map();
        this.classAccesses = new Map();
        this.pageAccesses = new Map();
        this.recordTypeVisibilities = new Map();
        this.tabVisibilities = new Map();
        this.applicationVisibilities = new Map();
        this.objectPermissions = new Map();
    }
    static fromXml(filePath, json) {
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
    toXmlObj() {
        const xmlObj = {
            Profile: {
                $: {
                    xmlns: sfdx_core_1.SfdxCore.DEFAULT_XML_NAMESPACE
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
    getPermissionCollection(metadataName) {
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
exports.PermissionSet = PermissionSet;
class SfdxPermission {
    static getPermisionString(permissionSet) {
        let result = '';
        if (permissionSet instanceof ObjectPermission) {
            result += permissionSet.toString();
        }
        else if (permissionSet instanceof FieldPermission) {
            result += permissionSet.toString();
        }
        else if (permissionSet instanceof TabPermission) {
            result += permissionSet.toString();
        }
        else if (permissionSet instanceof RecordTypePermission ||
            permissionSet instanceof ApplicationPermission) {
            result += permissionSet.toString();
        }
        else if (permissionSet instanceof UserPermission ||
            permissionSet instanceof ClassPermission ||
            permissionSet instanceof PagePermission) {
            result += permissionSet.toString();
        }
        return result.length === 0
            ? ''
            : result.trimRight();
    }
}
exports.SfdxPermission = SfdxPermission;
SfdxPermission.apexClass = 'ApexClass';
SfdxPermission.apexPage = 'ApexPage';
SfdxPermission.customApplication = 'CustomApplication';
SfdxPermission.customObject = 'CustomObject';
SfdxPermission.customField = 'CustomField';
SfdxPermission.customTab = 'CustomTab';
SfdxPermission.permissionSet = 'PermissionSet';
SfdxPermission.profile = 'Profile';
SfdxPermission.recordType = 'RecordType';
SfdxPermission.defaultPermissionMetaTypes = [
    SfdxPermission.apexClass,
    SfdxPermission.apexPage,
    SfdxPermission.customApplication,
    SfdxPermission.customObject,
    SfdxPermission.customTab,
    SfdxPermission.permissionSet,
    SfdxPermission.profile
];
//# sourceMappingURL=sfdx-permission.js.map