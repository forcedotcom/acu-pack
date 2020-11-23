import { expect } from '@salesforce/command/lib/test';
import { SfdxTasks } from '../../src/lib/sfdx-tasks';
import Utils from '../../src/lib/utils';

const optionsPath = "./options.json";
beforeEach('Cleanup', async () => {
  await Utils.deleteFileAsync(optionsPath);
});
describe('Sfdx Tasks Tests', () => {
  describe('getPackageOptions Tests', function () {
    it('Can Handle Null', async function () {
      expect(await SfdxTasks.getPackageOptionsAsync(null)).to.be.undefined;
      expect(await Utils.pathExistsAsync(optionsPath)).to.be.false;
    });
    it('Creates New Object & File', async function () {
      const options = await SfdxTasks.getPackageOptionsAsync(optionsPath);

      // It writes the file
      expect(await Utils.pathExistsAsync(optionsPath)).is.true;

      // It contains default data
      expect(options).to.not.be.null;
      expect(options.excludeMetadataTypes).to.be.instanceOf(Array);
      expect(options.excludeMetadataTypes.length).to.not.equal(0);
    });
  });
  describe('getXPathOptions Tests', function () {
    it('Can Handle Null', async function () {
      expect(await SfdxTasks.getXPathOptionsAsync(null)).to.be.undefined;
      expect(await Utils.pathExistsAsync(optionsPath)).to.be.false;
    });
    it('Creates New Object & File', async function () {
      const options = await SfdxTasks.getXPathOptionsAsync(optionsPath);

      // It writes the file
      expect(await Utils.pathExistsAsync(optionsPath)).is.true;

      // It contains default data
      expect(options).to.not.be.null;
      expect(options.rules).to.be.instanceOf(Map);
      expect(options.rules.size).to.not.equal(0);
    });
  });
  describe('getUnmaskOptions Tests', function () {
    it('Can Handle Null', async function () {
      expect(await SfdxTasks.getUnmaskOptionsAsync(null)).to.be.undefined;
      expect(await Utils.pathExistsAsync(optionsPath)).to.be.false;
    });
    it('Creates New Object & File', async function () {
      const options = await SfdxTasks.getUnmaskOptionsAsync(optionsPath);

      // It writes the file
      expect(await Utils.pathExistsAsync(optionsPath)).is.true;

      // It contains default data
      expect(options).to.not.be.null;
      expect(options.sandboxes).to.be.instanceOf(Map);
      expect(options.sandboxes.size).to.not.equal(0);
      for (const [org, users] of options.sandboxes) {
        expect(org).to.not.be.null;
        expect(users).to.be.instanceOf(Array);
      }
    });
  });
});
