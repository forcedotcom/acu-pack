"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const path = require("path");
const sfdx_query_1 = require("./sfdx-query");
const xmldec = { version: '1.0', encoding: 'UTF-8' };
const profileNodeNamespace = 'http://soap.sforce.com/2006/04/metadata';
const nonArrayKeys = ['custom', 'description', 'fullName', 'userLicense'];
const profileAPINameMatch = new Map([
    ['Contract Manager', 'ContractManager'],
    ['Marketing User', 'MarketingProfile'],
    ['Solution Manager', 'SolutionManager'],
    ['Read Only', 'ReadOnly'],
    ['Standard User', 'Standard'],
    ['System Administrator', 'Admin'],
    ['Contract Manager', 'ContractManager'],
    ['Marketing User', 'MarketingProfile'],
    ['Solution Manager', 'SolutionManager'],
    ['Read Only', 'ReadOnly'],
    ['Standard Platform User', 'StandardAul']
]);
class ProfileDownload {
    constructor(sfdxCon, orgAlias, profileList, profileIDMap, rootDir, ux) {
        this.sfdxCon = sfdxCon;
        this.orgAlias = orgAlias;
        this.profileList = profileList;
        this.profileIDMap = profileIDMap;
        this.rootDir = rootDir;
        this.ux = ux;
        this.profileFilePath = new Map();
    }
    static async processMissingObjectPermissions(objectData, includedObjects) {
        const profileObjectPermissions = new Map();
        const uniqueObjectNames = new Set();
        for (const obj of objectData) {
            if (uniqueObjectNames.add(obj.SobjectType) && !includedObjects.includes(obj.SobjectType)) {
                const objPemission = ProfileDownload.objPermissionStructure(obj.SobjectType, obj.PermissionsRead, obj.PermissionsCreate, obj.PermissionsEdit, obj.PermissionsDelete, obj.PermissionsViewAllRecords, obj.PermissionsModifyAllRecords);
                profileObjectPermissions.set(obj.SobjectType, objPemission);
            }
        }
        return profileObjectPermissions;
    }
    static async processMissingFieldPermissions(fielddata) {
        const profileFieldPermissions = [];
        const uniqueFieldNames = new Set();
        for (const field of fielddata) {
            if (uniqueFieldNames.add(field.Field)) {
                const fieldPemission = ProfileDownload.fieldPermissionStructure(field.Field, field.PermissionsEdit, field.PermissionsRead);
                profileFieldPermissions.push(fieldPemission);
            }
        }
        return profileFieldPermissions;
    }
    static async writeProfileToXML(profileMetadata, filePath) {
        profileMetadata['$'] = {
            xmlns: profileNodeNamespace
        };
        // Delete empty arrays
        for (const objKey in profileMetadata) {
            if (Array.isArray(profileMetadata[objKey])) {
                if (!nonArrayKeys.includes(objKey) && profileMetadata[objKey] && profileMetadata[objKey].length === 0) {
                    delete profileMetadata[objKey];
                }
            }
        }
        const xmlOptions = {
            renderOpts: { pretty: true, indent: '    ', newline: '\n' },
            rootName: 'Profile',
            xmldec
        };
        await utils_1.default.writeObjectToXmlFile(filePath, profileMetadata, xmlOptions);
    }
    // Return all profiles in the Org
    static async checkOrgProfiles(orgName) {
        const profileMap = new Map();
        if (!orgName)
            return profileMap;
        const getProfiles = await sfdx_query_1.SfdxQuery.doSoqlQuery(orgName, 'Select Id, Name from Profile');
        if (getProfiles.length > 0) {
            for (const profile of getProfiles) {
                const profileName = profileAPINameMatch.has(profile.Name)
                    ? profileAPINameMatch.get(profile.Name)
                    : profile.Name;
                profileMap.set(profileName, profile.Id);
            }
        }
        return profileMap;
    }
    static objPermissionStructure(objName, allowRead, allowCreate, allowEdit, allowDelete, viewAllRecords, modifyAllRecords) {
        const objStructure = {
            object: objName,
            allowRead,
            allowCreate,
            allowEdit,
            allowDelete,
            viewAllRecords,
            modifyAllRecords
        };
        return objStructure;
    }
    static fieldPermissionStructure(field, editable, readable, hidden) {
        const fieldStructure = {
            field,
            editable,
            readable
        };
        return fieldStructure;
    }
    async downloadPermissions() {
        if (!(await utils_1.default.pathExists(path.join(this.rootDir, utils_1.default._tempFilesPath)))) {
            await utils_1.default.mkDirPath(path.join(this.rootDir, utils_1.default._tempFilesPath));
        }
        const resultsArray = [];
        for (const profileName of this.profileList) {
            resultsArray.push(this.getProfileMetaData(profileName));
        }
        await Promise.all(resultsArray);
        return this.profileFilePath;
    }
    async retrieveProfileMetaData(profileName) {
        return new Promise((resolve, reject) => {
            this.sfdxCon.metadata
                .readSync('Profile', profileName)
                .then(async (data) => {
                resolve(data);
            })
                .catch(err => {
                reject(err);
            });
        });
    }
    async getProfileMetaData(profileName) {
        try {
            this.ux.log(`Downloading \"${profileName}\" Profile ...`);
            const response = await this.retrieveProfileMetaData(profileName);
            if (!response || response.length !== 1) {
                return;
            }
            const filePath = path.join(path.join(this.rootDir, utils_1.default._tempFilesPath, profileName + '.json'));
            this.profileFilePath.set(profileName, filePath);
            const profileJson = response[0].Metadata;
            const retrievedObjects = [];
            if (profileJson['objectPermissions'] && Array.isArray(profileJson.objectPermissions)) {
                for (const obj of profileJson.objectPermissions) {
                    retrievedObjects.push(obj['object']);
                }
                const objectPermQuery = 'select Parent.ProfileId,' +
                    'PermissionsCreate,' +
                    'PermissionsDelete,' +
                    'PermissionsEdit,' +
                    'PermissionsModifyAllRecords,' +
                    'PermissionsRead,' +
                    'PermissionsViewAllRecords,' +
                    'SobjectType ' +
                    'from ' +
                    'ObjectPermissions ' +
                    'where ' +
                    'Parent.ProfileId=' + '\'' + this.profileIDMap.get(profileName) + '\' ' +
                    'order by SObjectType ASC';
                const objData = await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, objectPermQuery);
                const processObjData = await ProfileDownload.processMissingObjectPermissions(objData, retrievedObjects);
                const objList = [...processObjData.keys()];
                if (objList.length > 0) {
                    let index = 0;
                    let whereClause = ' in (';
                    for (const obj of objList) {
                        whereClause = whereClause + "'" + obj + "'";
                        if (!(index === objList.length - 1)) {
                            whereClause = whereClause + ',';
                        }
                        index++;
                    }
                    whereClause = whereClause + ') ';
                    const fieldPermQuery = 'select Field,' +
                        'Parent.ProfileId,' +
                        'SobjectType,' +
                        'PermissionsEdit,' +
                        'PermissionsRead ' +
                        'from ' +
                        'FieldPermissions ' +
                        'where ' +
                        'SobjectType  ' + whereClause +
                        ' AND Parent.ProfileId=' + '\'' + this.profileIDMap.get(profileName) + '\'';
                    const fieldMissingData = await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, fieldPermQuery);
                    const processFieldData = await ProfileDownload.processMissingFieldPermissions(fieldMissingData);
                    profileJson.objectPermissions.push(...processObjData.values());
                    if (profileJson.fieldLevelSecurities && profileJson.fieldLevelSecurities.length > 0) {
                        profileJson.fieldLevelSecurities.push(...processFieldData);
                    }
                    else {
                        profileJson.fieldPermissions.push(...processFieldData);
                    }
                }
            }
            await utils_1.default.writeFile(filePath, JSON.stringify(profileJson));
        }
        catch (err) {
            this.ux.log(`Error downloading \"${profileName}\" Profile ...`);
            await utils_1.default.log(JSON.stringify(err), 'error');
        }
    }
}
exports.ProfileDownload = ProfileDownload;
//# sourceMappingURL=profile-download.js.map