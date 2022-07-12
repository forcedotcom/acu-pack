import { expect } from '@salesforce/command/lib/test';
import { SfdxQuery } from '../../src/lib/sfdx-query';
import { SfdxClient, ApiKind } from '../../src/lib/sfdx-client';
import Utils from '../../src/lib/utils';
import { RestAction } from '../../src/lib/utils';
import Setup from './setup'
const unknownId = '00000000001';
const NOT_FOUND = '(404) Not Found';

const orgAlias: string = Setup.orgAlias;
let sfdxClient: SfdxClient;
enum ApiTestKind {
  DEFAULT = 'Account',
  USER = 'User',
  TOOLING = 'ApexCodeCoverageAggregate',
  UNKNOWN = 'Bogus',
  FILE = 'ContentVersion'
}

const testData = new Map<ApiTestKind, any[]>();
before('Init', async function () {
  this.timeout(0);
  if(!orgAlias) {
    return;
  }
  /* eslint-disable-next-line no-console */
  console.log('Getting Test Data....');
  sfdxClient = new SfdxClient(orgAlias);
  let dataErr: Error = null;
  const getData = async (): Promise<void> => {
    try {
      let query = `SELECT Id, Name, Description FROM ${ApiTestKind.DEFAULT.toString()} LIMIT 5`;
      testData.set(ApiTestKind.DEFAULT, await SfdxQuery.doSoqlQuery(orgAlias, query, null, null, false));
      /* eslint-disable-next-line no-console */
      console.log(`Got ${ApiTestKind.DEFAULT.toString()} Test Data.`);

      query = `SELECT Id FROM ${ApiTestKind.TOOLING.toString()} LIMIT 5`;
      testData.set(ApiTestKind.TOOLING, await SfdxQuery.doSoqlQuery(orgAlias, query, null, null, true));
      /* eslint-disable-next-line no-console */
      console.log(`Got ${ApiTestKind.TOOLING.toString()} Test Data.`);

      query = `SELECT Id, Username, FirstName, Email FROM ${ApiTestKind.USER.toString()} LIMIT 5`;
      testData.set(ApiTestKind.USER, await SfdxQuery.doSoqlQuery(orgAlias, query, null, null, false));
      /* eslint-disable-next-line no-console */
      console.log(`Got ${ApiTestKind.USER.toString()} Test Data.`);

      query = `SELECT Id, VersionData FROM ${ApiTestKind.FILE.toString()} ORDER BY CreatedDate DESC LIMIT 5`;
      testData.set(ApiTestKind.FILE, await SfdxQuery.doSoqlQuery(orgAlias, query, null, null, false));
      /* eslint-disable-next-line no-console */
      console.log(`Got ${ApiTestKind.FILE.toString()} Test Data.`);

    } catch (err) {
      if (err.name === 'NoOrgFound') {
        /* eslint-disable-next-line no-console */
        console.warn(`Invalid OrgAlias: '${orgAlias}'. SfdxClient tests will be skipped.`);
        sfdxClient = null;
        return;
      }
      dataErr = err;
    }

  };
  await getData();
  if (dataErr) {
    /* eslint-disable-next-line no-console */
    console.log(`Error: ${dataErr.message}`);
    throw dataErr;
  }
  /* eslint-disable-next-line no-console */
  console.log('Got Test Data.');
});

describe('Rest Client Tests', () => {
  describe('do Tests', function () {
    this.timeout(0); // Times out due to blocking API init
    it('Can GET Scehma', async function () {
      if (!sfdxClient) {
        this.skip();
      }
      for await (const result of sfdxClient.getMetadataSchemas()) {
        expect(result).to.not.be.undefined;
        expect(result.name).to.not.be.undefined;
      }
    });
    it('Can GET Max API', async function () {
      if (!sfdxClient) {
        this.skip();
      }
      const result = await sfdxClient.getMaxApiVersion();
      expect(result).to.not.be.undefined;
    });
    it('Can GET Default Scehma', async function () {
      if (!sfdxClient) {
        this.skip();
      }
      const metaDataType = ApiTestKind.DEFAULT.toString();
      const result = (await sfdxClient.getMetadataSchema(metaDataType)).getContent();
      expect(result).to.not.be.undefined;
      expect(result.objectDescribe).to.not.be.undefined;
      expect(result.objectDescribe.name).to.equal(metaDataType);
    });
    it('Can GET Tooling Scehma', async function () {
      if (!sfdxClient) {
        this.skip();
      }
      const metaDataType = ApiTestKind.TOOLING.toString();
      const result = (await sfdxClient.getMetadataSchema(metaDataType, ApiKind.TOOLING)).getContent();
      expect(result).to.not.be.undefined;
      expect(result.objectDescribe).to.not.be.undefined;
      expect(result.objectDescribe.name).to.equal(metaDataType);
    });
    it('Can Handle 404 (Default Schema)', async function () {
      if (!sfdxClient) {
        this.skip();
      }
      const unknownMetaDataType = ApiTestKind.UNKNOWN.toString();
      try {
        (await sfdxClient.getMetadataSchema(unknownMetaDataType)).getContent();
      } catch (err) {
        expect(err.message).to.contain(NOT_FOUND);
      }
    });
    it('Can Handle 404 (Default Record)', async function () {
      if (!sfdxClient) {
        this.skip();
      }
      const metaDataType = ApiTestKind.DEFAULT.toString();
      try {
        (await sfdxClient.getById(metaDataType, unknownId)).getContent();
      } catch (err) {
        expect(err.message).to.contain(NOT_FOUND);
      }
    });
    it('Can Handle 404 (Tooling Schema)', async function () {
      if (!sfdxClient) {
        this.skip();
      }
      const unknownMetaDataType = ApiTestKind.UNKNOWN.toString();
      try {
        (await sfdxClient.getMetadataSchema(unknownMetaDataType, ApiKind.TOOLING)).getContent();
      } catch (err) {
        expect(err.message).to.contain(NOT_FOUND);
      }
    });
    it('Can Handle 404 (Tooling Record)', async function () {
      if (!sfdxClient) {
        this.skip();
      }
      const metaDataType = ApiTestKind.DEFAULT.toString();
      try {
        (await sfdxClient.getById(metaDataType, unknownId, ApiKind.TOOLING)).getContent();
      } catch (err) {
        expect(err.message).to.contain(NOT_FOUND);
      }
    });
    it('Can get Tooling Instance', async function () {
      if (!sfdxClient) {
        this.skip();
      }
      const metaDataType = ApiTestKind.TOOLING.toString();
      const ids = Utils.getFieldValues(testData.get(ApiTestKind.TOOLING), 'Id', true);
      for (const id of ids) {
        const result = (await sfdxClient.getById(metaDataType, id, ApiKind.TOOLING)).getContent();
        expect(result).to.not.be.null;
        expect(result.Id).to.equal(id);
      }
    });
    it('Can get Tooling Instances', async function () {
      if (!sfdxClient) {
        this.skip();
      }
      const metaDataType = ApiTestKind.TOOLING.toString();
      const ids = Utils.getFieldValues(testData.get(ApiTestKind.TOOLING), 'Id', true);
      let counter = 0;
      for await (const result of sfdxClient.getByIds(metaDataType, ids, ApiKind.TOOLING)) {
        const content = result.getContent();
        expect(content).to.not.be.null;
        expect(content.Id).to.equal(ids[counter++]);
      }
    });
    it('Can get Default Instance', async function () {
      if (!sfdxClient) {
        this.skip();
      }
      const metaDataType = ApiTestKind.DEFAULT.toString();
      const ids = Utils.getFieldValues(testData.get(ApiTestKind.DEFAULT), 'Id', true);
      for (const id of ids) {
        const result = (await sfdxClient.getById(metaDataType, id)).getContent();
        expect(result).to.not.be.null;
        expect(result.Id).to.equal(id);
      }
    });
    it('Can get VersionData from ContentVersion', async function () {
      if (!sfdxClient) {
        this.skip();
      }
      const metaDataType = ApiTestKind.FILE.toString();
      const ids = Utils.getFieldValues(testData.get(ApiTestKind.FILE), 'Id', true);
      for (const id of ids) {
        const result = await sfdxClient.getById(metaDataType+'.VersionData', id);
        expect(result).to.not.be.null;
        expect(result.id).to.equal(id);
        expect(result.id).to.equal(id);
        expect(result.isBinary).to.be.true;
        const bytes = (result).getContent();
        expect(bytes instanceof Buffer).to.be.true;
      }
    });
    it('Can get Default Instances', async function () {
      if (!sfdxClient) {
        this.skip();
      }
      const metaDataType = ApiTestKind.DEFAULT.toString();
      const ids = Utils.getFieldValues(testData.get(ApiTestKind.DEFAULT), 'Id', true);
      let counter = 0;
      for await (const result of sfdxClient.getByIds(metaDataType, ids)) {
        const content = result.getContent();
        expect(content).to.not.be.null;
        expect(content.Id).to.equal(ids[counter++]);
      }
    });
    it('Can update Default Instance', async function () {
      if (!sfdxClient) {
        this.skip();
      }
      const metaDataType = ApiTestKind.DEFAULT.toString();
      const desc = new Date().toJSON();
      for (const record of testData.get(ApiTestKind.DEFAULT)) {
        const result = (await sfdxClient.updateByRecord(metaDataType, { Id: record.Id, Description: desc }, 'Id')).getContent();
        expect(result).to.not.be.null;
        expect(result).to.equal(record.Id);
      }
    });
    it('Can update composite', async function () {
      if (!sfdxClient) {
        this.skip();
      }
      const desc = new Date().toJSON();

      const patchObj = {
        allOrNone: false,
        records: []
      };

      for (const record of testData.get(ApiTestKind.DEFAULT)) {
        patchObj.records.push({
          attributes: { type: ApiTestKind.DEFAULT.toString() },
          id: record.Id,
          Description: desc
        });
      }

      const results = (await sfdxClient.doComposite(RestAction.PATCH, patchObj)).getContent();
      for (const result of results) {
        if (result.errors && result.errors.length > 0) {
          expect.fail(JSON.stringify(result.errors));
        }
        expect(result.success).to.be.true;
      }
    });
  });
});
