import path = require('path');
import { UX } from '@salesforce/command';
import { Connection } from 'jsforce';
import Utils from './utils';
import { SfdxQuery } from './sfdx-query';
import Constants from './constants';

export class ProfileDownload {
  public profileFilePath: Map<string, string> = new Map<string, string>();

  public constructor(
    public sfdxCon: Connection,
    public orgAlias: string,
    public profileList: string[],
    public profileIDMap: Map<string, string>,
    public rootDir: string,
    public ux: UX
  ) {}

  public static processMissingObjectPermissions(objectData: any[], includedObjects: string[]): Map<string, any> {
    const profileObjectPermissions: Map<string, any> = new Map<string, any>();
    const uniqueObjectNames = new Set<string>();
    for (const obj of objectData) {
      if (uniqueObjectNames.add(obj.SobjectType) && !includedObjects.includes(obj.SobjectType)) {
        const objPemission = ProfileDownload.objPermissionStructure(
          obj.SobjectType,
          obj.PermissionsRead,
          obj.PermissionsCreate,
          obj.PermissionsEdit,
          obj.PermissionsDelete,
          obj.PermissionsViewAllRecords,
          obj.PermissionsModifyAllRecords
        );

        profileObjectPermissions.set(obj.SobjectType, objPemission);
      }
    }

    return profileObjectPermissions;
  }

  public static processMissingFieldPermissions(fielddata: any[]): any[] {
    const profileFieldPermissions: any[] = [];

    const uniqueFieldNames = new Set<string>();
    for (const field of fielddata) {
      if (uniqueFieldNames.add(field.Field)) {
        const fieldPemission = ProfileDownload.fieldPermissionStructure(
          field.Field,
          field.PermissionsEdit,
          field.PermissionsRead
        );
        profileFieldPermissions.push(fieldPemission);
      }
    }
    return profileFieldPermissions;
  }

  /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
  public static async writeProfileToXML(profileMetadata: any, filePath: string): Promise<void> {
    profileMetadata['$'] = {
      xmlns: Constants.DEFAULT_XML_NAMESPACE,
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

    await Utils.writeObjectToXmlFile(filePath, profileMetadata, xmlOptions);
  }

  // Return all profiles in the Org
  public static async checkOrgProfiles(orgName: string): Promise<Map<string, string>> {
    const profileMap: Map<string, string> = new Map<string, string>();
    if (!orgName) {
      return profileMap;
    }
    const profileAPINameMatch: Map<string, string> = new Map<string, string>([
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

    const getProfiles = await SfdxQuery.doSoqlQuery(orgName, 'Select Id, Name from Profile');

    if (getProfiles.length > 0) {
      for (const profile of getProfiles) {
        const profileName = profileAPINameMatch.get(profile.Name) || profile.Name;
        profileMap.set(profileName, profile.Id);
      }
    }
    return profileMap;
  }

  private static objPermissionStructure(
    objName: string,
    allowRead: boolean,
    allowCreate: boolean,
    allowEdit: boolean,
    allowDelete: boolean,
    viewAllRecords: boolean,
    modifyAllRecords: boolean
  ): any {
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

  private static fieldPermissionStructure(field: string, editable: boolean, readable: boolean): any {
    const fieldStructure = {
      field,
      editable,
      readable,
    };
    return fieldStructure;
  }

  public async downloadPermissions(): Promise<Map<string, string>> {
    if (!(await Utils.pathExists(path.join(this.rootDir, Utils.TempFilesPath)))) {
      await Utils.mkDirPath(path.join(this.rootDir, Utils.TempFilesPath));
    }

    const resultsArray: Array<Promise<any>> = [];

    for (const profileName of this.profileList) {
      resultsArray.push(this.getProfileMetaData(profileName));
    }

    await Promise.all(resultsArray);

    return this.profileFilePath;
  }

  public retrieveProfileMetaData(profileName: string): Promise<any> {
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

  public async getProfileMetaData(profileName: string): Promise<void> {
    if (!profileName) {
      return;
    }

    try {
      this.ux.log(`Downloading '${profileName}' Profile ...`);
      const profileJson = await this.retrieveProfileMetaData(profileName);
      if (!profileJson) {
        return;
      }

      const filePath = path.join(path.join(this.rootDir, Utils.TempFilesPath, profileName + '.json'));
      this.profileFilePath.set(profileName, filePath);

      const retrievedObjects: string[] = [];
      if (profileJson['objectPermissions'] && Array.isArray(profileJson.objectPermissions)) {
        for (const obj of profileJson.objectPermissions as []) {
          retrievedObjects.push(obj['object']);
        }

        const objectPermQuery: string =
          'SELECT Parent.ProfileId,' +
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

        const objData = await SfdxQuery.doSoqlQuery(this.orgAlias, objectPermQuery);

        const processObjData = ProfileDownload.processMissingObjectPermissions(objData, retrievedObjects);
        if (processObjData.size !== 0) {
          const sobjects = [];
          for (const obj of processObjData.keys()) {
            sobjects.push(`'${obj}'`);
          }

          const fieldPermQuery =
            'SELECT Field,' +
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

          const fieldMissingData = await SfdxQuery.doSoqlQuery(this.orgAlias, fieldPermQuery);

          const processFieldData = ProfileDownload.processMissingFieldPermissions(fieldMissingData);

          profileJson.objectPermissions.push(...processObjData.values());
          if (profileJson.fieldLevelSecurities && profileJson.fieldLevelSecurities.length > 0) {
            profileJson.fieldLevelSecurities.push(...processFieldData);
          } else {
            profileJson.fieldPermissions.push(...processFieldData);
          }
        }
      }
      await Utils.writeFile(filePath, JSON.stringify(profileJson));
    } catch (err) {
      this.ux.log(`Error downloading '${profileName}' Profile ...`);
      await Utils.log(JSON.stringify(err), 'error');
    }
  }
}
