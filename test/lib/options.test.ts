import { expect } from '@salesforce/command/lib/test';
import { OptionsFactory } from '../../src/lib/options-factory';
import { PackageOptions } from '../../src/lib/package-options';
import { UnmaskOptions } from '../../src/lib/unmask-options';
import { XPathOptions } from '../../src/lib/xpath-options';
import Utils from '../../src/lib/utils';

const optionsPath = "./options.json";
beforeEach('Cleanup', async () => {
  await Utils.deleteFileAsync(optionsPath);
});
describe('Options Tests', () => {
  describe('PackageOptions Tests', function () {
    it('Creates New Object & File', async function () {
      const options = await OptionsFactory.get(PackageOptions, optionsPath);

      // It writes the file
      expect(await Utils.pathExistsAsync(optionsPath)).is.true;

      // It contains default data
      expect(options).to.not.be.null;
      expect(options.excludeMetadataTypes).to.be.instanceOf(Array);
      expect(options.excludeMetadataTypes.length).to.not.equal(0);
    });
  });
  describe('XPathOptions Tests', function () {
    it('Creates New Object & File', async function () {
      const options = await OptionsFactory.get(XPathOptions, optionsPath);

      // It writes the file
      expect(await Utils.pathExistsAsync(optionsPath)).is.true;

      // It contains default data
      expect(options).to.not.be.null;
      expect(options.rules).to.be.instanceOf(Map);
      expect(options.rules.size).to.not.equal(0);
    });
  });
  describe('UnmaskOptions Tests', function () {
    it('Creates New Object & File', async function () {
      const options = await OptionsFactory.get(UnmaskOptions, optionsPath);
      expect(options.userQuery).to.not.be.undefined;
      expect(options.userQuery.length).to.not.equal(0);

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
    it('Updates File', async function () {
      const options = await OptionsFactory.get(UnmaskOptions, optionsPath);
      expect(options.userQuery).to.not.be.undefined;
      expect(options.userQuery.length).to.not.equal(0);

      // It writes the file
      expect(await Utils.pathExistsAsync(optionsPath)).is.true;

      options.userQuery = 'MJM';
      await options.save(optionsPath);

      const options1 = await OptionsFactory.get(UnmaskOptions, optionsPath);
      expect(options1.userQuery).to.equal('MJM');
    });
  });
});
