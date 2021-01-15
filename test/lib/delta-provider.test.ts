import { flags } from '@salesforce/command';
import { expect } from '@salesforce/command/lib/test';
import { DeltaProvider } from '../../src/lib/delta-provider'

class TestProvider extends DeltaProvider {
  public name = 'test';
  public deltaLineToken = '\t';
  public deltas = new Map<string, any>();

  public processDeltaLine(deltaLine: string): void {
    const parts = deltaLine.split(this.deltaLineToken);
    this.deltas.set(parts[1], parts[0]);
  }

  public getMessage(name: string): string {
    if (name) {
      return 'test';
    }
  }

  public async * diff(source: string) {
    if (source)
      return null;
  }

  public async logMessage(message: string, includeConsole = false): Promise<void> {
    console.log(message);
    if (includeConsole) {
      console.log(message);
    }
  }

}
describe("DeltaCommand Tests", function () {
  describe("getFlagsConfig Tests", function () {
    const testProvider = new TestProvider();
    it("Can Handle Nulls", async function () {
      const testFlags = testProvider.getFlagsConfig(null);
      expect(testFlags).is.not.null;
      expect(validateFlags(testFlags));
    });

    it("Can Add a Flag", async function () {
      const testFlagsConfig = testProvider.getFlagsConfig({
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

      expect(validateFlags(testFlagsConfig));
    });
  });

  function validateFlags(flagsConfig: any) {
    expect(flagsConfig);
    expect(flagsConfig.source);
    expect(flagsConfig.source.char).equals('s');
    expect(flagsConfig.source.required).is.true;
    expect(flagsConfig.source.description).is.not.null;

    expect(flagsConfig.destination);
    expect(flagsConfig.destination.char).equals('d');
    expect(flagsConfig.destination.required).is.undefined;
    expect(flagsConfig.destination.description).is.not.null;

    expect(flagsConfig.force);
    expect(flagsConfig.force.char).equals('f');
    expect(flagsConfig.force.required).is.undefined;
    expect(flagsConfig.force.description).is.not.null;

    expect(flagsConfig.ignore);
    expect(flagsConfig.ignore.char).equals('i');
    expect(flagsConfig.ignore.required).is.undefined;
    expect(flagsConfig.ignore.description).is.not.null;

    expect(flagsConfig.deletereport);
    expect(flagsConfig.deletereport.char).equals('r');
    expect(flagsConfig.deletereport.required).is.undefined;
    expect(flagsConfig.deletereport.description).is.not.null;

    expect(flagsConfig.check);
    expect(flagsConfig.check.char).equals('c');
    expect(flagsConfig.check.required).is.undefined;
    expect(flagsConfig.check.description).is.not.null;
  }
});
