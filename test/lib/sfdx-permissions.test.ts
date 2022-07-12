import path = require('path');
import { expect } from '@salesforce/command/lib/test';
import { before } from 'mocha';
import Utils from '../../src/lib/utils';
import { FieldDetail, ObjectDetail, PermissionSet } from '../../src/lib/sfdx-permission';

const profileMetadataFilePath = './test/force-app/main/default/profiles/sample.profile-meta.xml';
const permissionSetMetadataFilePath = './test/force-app/main/default/permissionsets/sample.permissionset-meta.xml';
const objectMetadataFilePath = './test/force-app/main/default/objects/Asset/Asset.object-meta.xml';
const fieldMetadataFilePath = './test/force-app/main/default/objects/Address__c/fields/Zip__c.field-meta.xml';

describe('Sfdx Permission Tests', () => {
  before(async () => {
    const exists = await Utils.pathExists(path.resolve(profileMetadataFilePath));
    expect(exists).to.be.true;



  });
  describe('Can read Metadata', function () {
    it('Can Handle Null', function () {
      let permissionSet = PermissionSet.fromXml(null, null);
      expect(permissionSet).is.null;

      permissionSet = PermissionSet.fromXml(null, {});
      expect(permissionSet).is.null;

      permissionSet = PermissionSet.fromXml('', {});
      expect(permissionSet).is.null;

      permissionSet = PermissionSet.fromXml(profileMetadataFilePath, null);
      expect(permissionSet).is.null;
    });
    it('Can Load Profile Metadata', async function () {
      const profileJson = await Utils.readObjectFromXmlFile(profileMetadataFilePath);
      expect(profileJson).to.not.be.null;

      const permissionSet = PermissionSet.fromXml(profileMetadataFilePath, profileJson);
      expect(permissionSet).is.not.null;
      expect(permissionSet.name).is.not.null;
      expect(profileMetadataFilePath.includes(permissionSet.name)).to.be.true;
    });
    it('Can Load PermisisonSet Metadata', async function () {
      const permissionSetJson = await Utils.readObjectFromXmlFile(permissionSetMetadataFilePath);
      expect(permissionSetJson).to.not.be.null;

      const permissionSet = PermissionSet.fromXml(permissionSetMetadataFilePath, permissionSetJson);
      expect(permissionSet).is.not.null;
      expect(permissionSet.name).is.not.null;
      expect(permissionSetMetadataFilePath.includes(permissionSet.name)).to.be.true;
    });
  });
  describe('Can read Object Metadata', function () {
    it('Can Handle Null', function () {
      let objectDetail = ObjectDetail.fromXml(null, null);
      expect(objectDetail).is.null;

      objectDetail = ObjectDetail.fromXml(null, {});
      expect(objectDetail).is.null;

      objectDetail = ObjectDetail.fromXml('', {});
      expect(objectDetail).is.null;

      objectDetail = ObjectDetail.fromXml(objectMetadataFilePath, null);
      expect(objectDetail).is.null;
    });
    it('Can Load Metadata', async function () {
      const objectJson = await Utils.readObjectFromXmlFile(objectMetadataFilePath);
      expect(objectJson).to.not.be.null;

      const objectDetail = ObjectDetail.fromXml(objectMetadataFilePath, objectJson);
      expect(objectDetail).is.not.null;
      expect(objectDetail.name).is.not.null;
      expect(objectMetadataFilePath.includes(objectDetail.name)).to.be.true;
    });
  });
  describe('Can read Field Metadata', function () {
    it('Can Handle Null', function () {
      let fieldDetail = FieldDetail.fromXml(null, null);
      expect(fieldDetail).is.null;

      fieldDetail = FieldDetail.fromXml(null, {});
      expect(fieldDetail).is.null;

      fieldDetail = FieldDetail.fromXml('', {});
      expect(fieldDetail).is.null;

      fieldDetail = FieldDetail.fromXml(fieldMetadataFilePath, null);
      expect(fieldDetail).is.null;
    });
    it('Can Load Metadata', async function () {
      const fieldJson = await Utils.readObjectFromXmlFile(fieldMetadataFilePath);
      expect(fieldJson).to.not.be.null;

      const fieldDetail = FieldDetail.fromXml(fieldMetadataFilePath, fieldJson);
      expect(fieldDetail).is.not.null;
      expect(fieldDetail.name).is.not.null;
      expect(fieldMetadataFilePath.includes(fieldDetail.name.split('.')[1])).to.be.true;
    });
  });
});
