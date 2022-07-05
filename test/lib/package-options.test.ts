import { expect } from '@salesforce/command/lib/test';
import { PackageOptions } from '../../src/lib/package-options';

describe('PackageOptions Tests', () => {
  it('Creates New Object', function() {
    const packageOptions = new PackageOptions();

    // It contains default data
    expect(packageOptions).is.not.null;
    expect(packageOptions.excludeMetadataTypes).is.not.null;
    expect(packageOptions.excludeMetadataTypes.length).equals(0);
  });
  it('Loads Defaults', function() {
    const packageOptions = new PackageOptions();
    packageOptions.loadDefaults();
    expect(packageOptions.excludeMetadataTypes).is.not.null;
    expect(packageOptions.excludeMetadataTypes.length).equals(0);
  });
});
