import { expect } from '@salesforce/command/lib/test';
import { OptionsFactory } from '../../src/lib/options-factory';
import SchemaOptions from '../../src/lib/schema-options';
import Utils from '../../src/lib/utils';

const optionsPath = "./options.json";
beforeEach('Cleanup', async () => {
  await Utils.deleteFile(optionsPath);
});
describe('OptionsFactory Tests', () => {
  it('Can Handle Null', async function () {
    expect(await OptionsFactory.get(SchemaOptions)).to.not.be.undefined;
    expect(await OptionsFactory.get(SchemaOptions, null)).to.not.be.undefined;
  });
  it('Load method is invoked', async function () {
    const options = await OptionsFactory.get(SchemaOptions);
    expect(options.outputDefMap).to.be.instanceOf(Map);
    expect(options.outputDefMap.size).to.not.equal(0);
  });
  it('Creates Options File', async function () {
    const options = await OptionsFactory.get(SchemaOptions, optionsPath);
    expect(options).to.not.be.undefined;
    
    const fileExists = await Utils.pathExists(optionsPath);
    expect(fileExists).to.be.true;
  });
});
