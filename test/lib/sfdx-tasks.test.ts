import { expect } from '@salesforce/command/lib/test';
import { SfdxTasks } from '../../src/lib/sfdx-tasks';
import Utils from '../../src/lib/utils';

const optionsPath = "./packageOptions.json";

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
});
