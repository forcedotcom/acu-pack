import { flags } from '@salesforce/command';
import { expect } from '@salesforce/command/lib/test';
import { DeltaCommandBase } from '../../src/lib/delta-command'

describe("DeltaCommand Tests", function () {
  describe("getFlagsConfig Tests", function () {
    it("Can Handle Nulls", async function () {
      const testFlags = DeltaCommandBase.getFlagsConfig(null);
      expect(testFlags).is.not.null;
    });

    it("Can Add a Flag", async function () {
      const testFlagsConfig = DeltaCommandBase.getFlagsConfig({
        test: flags.filepath({
          char: 't',
          required: true,
          description: 'test flag message'
        })
      });

      expect(testFlagsConfig).is.not.null;
      expect(testFlagsConfig.test);
      expect(testFlagsConfig.test.char).equals('t');
      expect(testFlagsConfig.test.required).is.true;
      expect(testFlagsConfig.test.description).is.not.null;
    });
  });
});
