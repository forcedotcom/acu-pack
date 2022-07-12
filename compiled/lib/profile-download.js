"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileDownload = void 0;
const path = require("path");
const utils_1 = require("./utils");
const sfdx_query_1 = require("./sfdx-query");
const constants_1 = require("./constants");
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
    static processMissingObjectPermissions(objectData, includedObjects) {
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
    static processMissingFieldPermissions(fielddata) {
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
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    static async writeProfileToXML(profileMetadata, filePath) {
        profileMetadata['$'] = {
            xmlns: constants_1.default.DEFAULT_XML_NAMESPACE,
        };
        const nonArrayKeys = ['custom', 'description', 'fullName', 'userLicense'];
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
            xmldec: { version: '1.0', encoding: 'UTF-8' },
        };
        await utils_1.default.writeObjectToXmlFile(filePath, profileMetadata, xmlOptions);
    }
    // Return all profiles in the Org
    static async checkOrgProfiles(orgName) {
        const profileMap = new Map();
        if (!orgName) {
            return profileMap;
        }
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
            ['Standard Platform User', 'StandardAul'],
        ]);
        const getProfiles = await sfdx_query_1.SfdxQuery.doSoqlQuery(orgName, 'Select Id, Name from Profile');
        if (getProfiles.length > 0) {
            for (const profile of getProfiles) {
                const profileName = profileAPINameMatch.get(profile.Name) || profile.Name;
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
            modifyAllRecords,
        };
        return objStructure;
    }
    static fieldPermissionStructure(field, editable, readable) {
        const fieldStructure = {
            field,
            editable,
            readable,
        };
        return fieldStructure;
    }
    async downloadPermissions() {
        if (!(await utils_1.default.pathExists(path.join(this.rootDir, utils_1.default.TempFilesPath)))) {
            await utils_1.default.mkDirPath(path.join(this.rootDir, utils_1.default.TempFilesPath));
        }
        const resultsArray = [];
        for (const profileName of this.profileList) {
            resultsArray.push(this.getProfileMetaData(profileName));
        }
        await Promise.all(resultsArray);
        return this.profileFilePath;
    }
    retrieveProfileMetaData(profileName) {
        if (!profileName) {
            return null;
        }
        return new Promise((resolve, reject) => {
            this.sfdxCon.metadata
                .readSync('Profile', profileName)
                .then((data) => {
                resolve(Array.isArray(data) ? data[0] : data);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    async getProfileMetaData(profileName) {
        if (!profileName) {
            return;
        }
        try {
            this.ux.log(`Downloading '${profileName}' Profile ...`);
            const profileJson = await this.retrieveProfileMetaData(profileName);
            if (!profileJson) {
                return;
            }
            const filePath = path.join(path.join(this.rootDir, utils_1.default.TempFilesPath, profileName + '.json'));
            this.profileFilePath.set(profileName, filePath);
            const retrievedObjects = [];
            if (profileJson['objectPermissions'] && Array.isArray(profileJson.objectPermissions)) {
                for (const obj of profileJson.objectPermissions) {
                    retrievedObjects.push(obj['object']);
                }
                const objectPermQuery = 'SELECT Parent.ProfileId,' +
                    'PermissionsCreate,' +
                    'PermissionsDelete,' +
                    'PermissionsEdit,' +
                    'PermissionsModifyAllRecords,' +
                    'PermissionsRead,' +
                    'PermissionsViewAllRecords,' +
                    'SobjectType ' +
                    'FROM ObjectPermissions ' +
                    'WHERE Parent.ProfileId=' +
                    "'" +
                    this.profileIDMap.get(profileName) +
                    "' " +
                    'ORDER BY SObjectType ASC';
                const objData = await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, objectPermQuery);
                const processObjData = ProfileDownload.processMissingObjectPermissions(objData, retrievedObjects);
                if (processObjData.size !== 0) {
                    const sobjects = [];
                    for (const obj of processObjData.keys()) {
                        sobjects.push(`'${obj}'`);
                    }
                    const fieldPermQuery = 'SELECT Field,' +
                        'Parent.ProfileId,' +
                        'SobjectType,' +
                        'PermissionsEdit,' +
                        'PermissionsRead ' +
                        'FROM FieldPermissions ' +
                        `WHERE SobjectType IN (${sobjects.join(',')})` +
                        ' AND Parent.ProfileId=' +
                        "'" +
                        this.profileIDMap.get(profileName) +
                        "'";
                    const fieldMissingData = await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, fieldPermQuery);
                    const processFieldData = ProfileDownload.processMissingFieldPermissions(fieldMissingData);
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
            this.ux.log(`Error downloading '${profileName}' Profile ...`);
            await utils_1.default.log(JSON.stringify(err), 'error');
        }
    }
}
exports.ProfileDownload = ProfileDownload;
//# sourceMappingURL=profile-download.js.map