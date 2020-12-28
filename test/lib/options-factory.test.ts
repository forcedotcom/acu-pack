import { expect } from '@salesforce/command/lib/test';
import { OptionsFactory } from '../../src/lib/options-factory';
import { PackageOptions } from '../../src/lib/package-options';
import Utils from '../../src/lib/utils';

const optionsPath = "./options.json";
beforeEach('Cleanup', async () => {
  await Utils.deleteFileAsync(optionsPath);
});
describe('OptionsFactory Tests', () => {
  it('Can Handle Null', async function () {
    expect(await OptionsFactory.get(PackageOptions)).to.not.be.undefined;
    expect(await OptionsFactory.get(PackageOptions, null)).to.not.be.undefined;
  });
  it('Load method is invoked', async function () {
    const options = await OptionsFactory.get(PackageOptions);
    expect(options.excludeMetadataTypes).to.be.instanceOf(Array);
    expect(options.excludeMetadataTypes.length).to.not.equal(0);
  });
  it('Creates Options File', async function () {
    const options = await OptionsFactory.get(PackageOptions, optionsPath);
    expect(options).to.not.be.undefined;
    
    const fileExists = await Utils.pathExistsAsync(optionsPath);
    expect(fileExists).to.be.true;
  });
});
