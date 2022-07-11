import { expect } from '@salesforce/command/lib/test';
import { PackageOptions } from '../../src/lib/package-options';
import { SfdxTasks } from '../../src/lib/sfdx-tasks';
import Utils from '../../src/lib/utils';
import { OptionsFactory } from '../../src/lib/options-factory';

const optionsPath = './options.json';
beforeEach('Cleanup', async () => {
  await Utils.deleteFile(optionsPath);
});
describe('PackageOptions Tests', () => {
  it('Creates New Object', function() {
    const packageOptions = new PackageOptions();

    // It contains default data
    expect(packageOptions).is.not.null;
    expect(packageOptions.excludeMetadataTypes).is.not.null;
    expect(packageOptions.excludeMetadataTypes.length).equals(0);
  });
  it('Does Loads Defaults from Metadata Coverage Report', async function() {
    this.timeout(0);
    const types  = await SfdxTasks.getUnsupportedMetadataTypes();
    const packageOptions = new PackageOptions();
    await packageOptions.loadDefaults();
    expect(packageOptions.excludeMetadataTypes).is.not.null;
    expect(packageOptions.excludeMetadataTypes.length).equals(types.length);
  });
  it('Does NOT LoadsDefaults from Metadata Coverage Report', async function() {
    this.timeout(0);
    const packageOptions = new PackageOptions();
    packageOptions.settings.blockExternalConnections = true;
    await packageOptions.loadDefaults();
    expect(packageOptions.excludeMetadataTypes).is.not.null;
    expect(packageOptions.excludeMetadataTypes.length).equals(0);
  });
  it('Loads Defaults from Metadata Coverage Report and saves', async function() {
    this.timeout(0);
    const types  = await SfdxTasks.getUnsupportedMetadataTypes();
    let packageOptions = new PackageOptions();
    await packageOptions.loadDefaults();
    await packageOptions.save(optionsPath);
    
    packageOptions = await OptionsFactory.get(PackageOptions, optionsPath);
    expect(packageOptions.excludeMetadataTypes).is.not.null;
    expect(packageOptions.excludeMetadataTypes.length).equals(types.length);
  });
  it(`Saves changes correctly and doesn't reload Metadata Coverage Report`,async function() {
    this.timeout(0);
    let packageOptions = new PackageOptions();
    await packageOptions.loadDefaults();
    packageOptions.excludeMetadataTypes = ['bogus_type__c'];
    await packageOptions.save(optionsPath);
    
    packageOptions = await OptionsFactory.get(PackageOptions, optionsPath);
    // It contains default data
    expect(packageOptions).is.not.null;
    expect(packageOptions.excludeMetadataTypes).is.not.null;
    expect(packageOptions.excludeMetadataTypes[0]).equals('bogus_type__c');
  });
});
