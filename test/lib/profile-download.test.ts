import { expect } from '@salesforce/command/lib/test';
import { UX } from '@salesforce/command';
import { ProfileDownload } from '../../src/lib/profile-download';
import Utils from '../../src/lib/utils';
import path = require('path');

const profileJson = {
  fullName: 'Admin',
  objectPermissions: [
    {
      allowCreate: true,
      allowDelete: true,
      allowEdit: true,
      allowRead: true,
      modifyAllRecords: true,
      object: 'Account',
      viewAllRecords: true
    }
  ],
  fieldPermissions: [
    {
      editable: false,
      field: 'Account.AccountNumber',
      readable: false
    }
  ],
  custom: true,
  userLicense: 'Salesforce'

};

const objectPermissionFromQuery = [
  {
    PermissionsCreate: true,
    PermissionsDelete: true,
    PermissionsEdit: true,
    PermissionsModifyAllRecords: true,
    PermissionsRead: true,
    PermissionsViewAllRecords: true,
    SobjectType: 'Company__c'
  }

];

const fieldPermissionsFromQuery = [
  {
    field: 'Company__c.Name__c',
    editable: true,
    readable: true
  }

];

describe('Profile Command Tests', () => {
  describe('Get Org Profiles Tests', () => {
    it('Can Handle Nulls', async () => {
      const orgProfiles = await ProfileDownload.checkOrgProfiles(null);
      expect(orgProfiles).is.not.null;
    });

  });

  describe('Missing Objects', () => {
    it('Process missing Objects', async () => {
      const getObjectPermissions = await ProfileDownload.processMissingObjectPermissions(objectPermissionFromQuery, ['Account']);
      expect(getObjectPermissions).to.include.keys('Company__c');
    });
  });

  describe('Missing Fields', () => {
    it('Process missing Fields', async () => {
      const getFieldPermissions = await ProfileDownload.processMissingFieldPermissions(fieldPermissionsFromQuery);
      expect(getFieldPermissions).to.be.an('array');
    });
  });

  describe('Write to XML files', () => {
    it(' Write to XML and store file', async () => {
      await ProfileDownload.writeProfileToXML(profileJson, path.join(process.cwd(), 'temp'));
      const readData = await Utils.readObjectFromXmlFile(path.join(process.cwd(), 'temp'));
      expect(readData).is.not.null;
      await Utils.deleteFile(path.join(process.cwd(), 'temp'));
    });
  });
  describe('Download Permissions', () => {
    it(' Download Permission', async () => {
      const profileDownloader = new ProfileDownload(null, null, ['Admin', 'Admin1'], null, path.join(process.cwd()), await UX.create());
      const permissions = await profileDownloader.downloadPermissions();
      expect(permissions).is.not.null;
      await Utils.deleteDirectory(path.join(process.cwd(), Utils._tempFilesPath));
    });
  });

});
