import { expect } from '@salesforce/command/lib/test';
import { OptionsBase } from '../../src/lib/options';
import { OptionsFactory } from '../../src/lib/options-factory';
import SchmeaOptions from '../../src/lib/schema-options';
import { UnmaskOptions } from '../../src/lib/unmask-options';
import { XPathOptions } from '../../src/lib/xpath-options';
import Utils from '../../src/lib/utils';

class TestOptions extends OptionsBase {
  private static CURRENT_VERSION: number = 2.0;
  public version: number = 1.0;
  
  public loadDefaults(): Promise<void> {
    return Promise.resolve();
  };

  public get isCurrentVersion(): boolean {
    return TestOptions.CURRENT_VERSION === this.version;
  }

  protected setCurrentVersion(): void {
    this.version = TestOptions.CURRENT_VERSION;
  }
}

const optionsPath = "./options.json";
beforeEach('Cleanup', async () => {
  await Utils.deleteFile(optionsPath);
});
describe('Options Tests', () => {
  describe('Version Tests', function () {
    it('Checks for old versions', function () {
      const options = new TestOptions();
      options.version = 1.0;

      expect(options).to.not.be.null;
      expect(options.isCurrentVersion).to.be.false;
    });
    it('Can set new version correctly', async function () {
      let options = new TestOptions();
      options.version = 2.0;
      await options.save(optionsPath);
      // It writes the file
      expect(await Utils.pathExists(optionsPath)).is.true;

      options = await OptionsFactory.get(TestOptions, optionsPath);
      // It contains default data
      expect(options).to.not.be.null;
      expect(options.isCurrentVersion).to.be.true;
    });
    it('Can automatically update version', async function () {
      let options = new TestOptions();
      options.version = 1.0;
      expect(options.isCurrentVersion).to.be.false;

      await Utils.writeFile(optionsPath, JSON.stringify(options));
      // It writes the file
      expect(await Utils.pathExists(optionsPath)).is.true;

      options = await OptionsFactory.get(TestOptions, optionsPath);
      // It contains default data
      expect(options).to.not.be.null;
      expect(options.isCurrentVersion).to.be.true;
    });
    it('Can NOT automatically update version', async function () {
      let options = new TestOptions();
      options.version = 1.0;
      expect(options.isCurrentVersion).to.be.false;

      await Utils.writeFile(optionsPath, JSON.stringify(options));
      // It writes the file
      expect(await Utils.pathExists(optionsPath)).is.true;
      
      options = await OptionsFactory.get(TestOptions, optionsPath, true);
      // It contains default data
      expect(options).to.not.be.null;
      expect(options.isCurrentVersion).to.be.false;
    });
  });
  describe('SchmeaOptions Tests', function () {
    it('Creates New Object & File', async function () {
      const options = await OptionsFactory.get(SchmeaOptions, optionsPath);

      // It writes the file
      expect(await Utils.pathExists(optionsPath)).is.true;

      // It contains default data
      expect(options).to.not.be.null;
      expect(options.outputDefMap).to.be.instanceOf(Map);
      expect(options.outputDefMap.size).to.not.equal(0);
    });
  });
  describe('XPathOptions Tests', function () {
    it('Creates New Object & File', async function () {
      const options = await OptionsFactory.get(XPathOptions, optionsPath);

      // It writes the file
      expect(await Utils.pathExists(optionsPath)).is.true;

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
      expect(await Utils.pathExists(optionsPath)).is.true;

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
      expect(await Utils.pathExists(optionsPath)).is.true;

      options.userQuery = 'MJM';
      await options.save(optionsPath);

      const options1 = await OptionsFactory.get(UnmaskOptions, optionsPath);
      expect(options1.userQuery).to.equal('MJM');
    });
  });
});
