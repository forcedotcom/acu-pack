import { expect } from '@salesforce/command/lib/test';
import { SfdxTasks, SfdxResult } from '../../src/lib/sfdx-tasks';
import Utils from '../../src/lib/utils';

const optionsPath = "./packageOptions.json";
// NOTE: These tests might fail without an authorized Org alias
const orgAlias = 'SOQLDEV';
before('Cleanup', async () => {
  await Utils.deleteFileAsync(optionsPath);
});
describe('Sfdx Tasks Tests', () => {
  describe('getPackageOptions Tests', function () {
    it('Can Handle Null', async function () {
      expect(await SfdxTasks.getPackageOptionsAsync(null)).to.be.undefined;
      expect(await Utils.pathExistsAsync(optionsPath)).to.be.false;
    });
    it('Creates New Object & File', async function () {
      const packageOptions = await SfdxTasks.getPackageOptionsAsync(optionsPath);

      // It writes the file
      expect(await Utils.pathExistsAsync(optionsPath)).is.true;

      // It contains default data
      expect(packageOptions).to.not.be.null;
      expect(packageOptions.excludeMetadataTypes).to.be.instanceOf(Array);
      expect(packageOptions.excludeMetadataTypes.length).to.not.equal(0);
    });
  });
  describe('deleteRecordsByIds Tests', function () {
    this.timeout(15000); // Times out due to query
    it('Can delete records', async function () {
      if (!orgAlias) {
        this.skip();
      }
      const ids = ['715r0000000XcmFAAS'];
      let counter = 0;
      for await (const result of SfdxTasks.deleteRecordsByIds(orgAlias, 'ApexCodeCoverageAggregate', ids, null, true)) {
        expect(result).to.not.be.null;
        expect(result).to.be.instanceOf(SfdxResult);
        expect(result.id).to.equal(ids[counter++]);
        expect(result.success).to.be.false;
        expect(result.errors[0]).to.equal('Not Found');
      }
    });
  });
});
