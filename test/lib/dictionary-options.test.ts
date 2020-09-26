import { expect } from '@salesforce/command/lib/test';
import { DictionaryOptions } from '../../src/lib/dictionary-options';

describe('DictionaryOptions Tests', () => {
  it('Creates New Object', function () {
    const dictionaryOptions = new DictionaryOptions();

    // It contains default data
    expect(dictionaryOptions).is.not.null;
    expect(dictionaryOptions.outputDefs).is.not.null;
    expect(dictionaryOptions.outputDefs.length).equals(0);
    expect(dictionaryOptions.excludeFieldIfTrueFilter).is.undefined;
  });
  it('Loads Defaults', function () {
    const dictionaryOptions = new DictionaryOptions();
    dictionaryOptions.loadDefaults();
    expect(dictionaryOptions.outputDefs.length).does.not.equal(0);
    expect(dictionaryOptions.excludeFieldIfTrueFilter).is.not.null;
  });
});
