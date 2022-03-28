import { flags } from '@salesforce/command';
import path = require('path');
import { expect } from '@salesforce/command/lib/test';
import { DeltaCommandBase } from '../../src/lib/delta-command'
import { DeltaProvider } from '../../src/lib/delta-provider';

const config = {
  deltaFilePath: 'md5',
  source: 'source',
  destination: 'destination',
  force: 'force',
  ignore: 'ignore',
  copyfulldir: DeltaCommandBase.defaultCopyDirList.join()
};

describe("DeltaProvider Tests", function () {
  describe("getFlagsConfig Tests", function () {
    it("Can Handle Nulls", async function () {
      const testFlags = DeltaCommandBase.getFlagsConfig(null);
      expect(testFlags).is.not.null;
      expect(validateFlags(testFlags));
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

      expect(validateFlags(testFlagsConfig));
    });
  });

  describe("getDeltaOptions Tests", function () {
    it("Can Handle Nulls", async function () {
      const deltaOptions = DeltaCommandBase.getDeltaOptions(null);
      expect(deltaOptions).is.not.null;
      expect(deltaOptions.deltaFilePath).is.undefined;
      expect(deltaOptions.source).is.undefined;
      expect(deltaOptions.destination).is.undefined;
      expect(deltaOptions.forceFile).is.undefined;
      expect(deltaOptions.ignoreFile).is.undefined;
      expect(deltaOptions.fullCopyDirNames).is.not.null;
    });

    it("Can Parse Config", async function () {
      const deltaOptions = DeltaCommandBase.getDeltaOptions(config);
      expect(deltaOptions.deltaFilePath).equals(config.deltaFilePath);
      expect(deltaOptions.source).equals(config.source);
      expect(deltaOptions.destination).equals(config.destination);
      expect(deltaOptions.forceFile).equals(config.force);
      expect(deltaOptions.ignoreFile).equals(config.ignore);
      expect(deltaOptions.fullCopyDirNames[0]).equals(DeltaCommandBase.defaultCopyDirList[0]);
      expect(deltaOptions.fullCopyDirNames[1]).equals(DeltaCommandBase.defaultCopyDirList[1]);
      expect(deltaOptions.fullCopyDirNames[2]).equals(DeltaCommandBase.defaultCopyDirList[2]);
    });
  });

  describe("fullCopyDirNames Tests", function () {
    it("Can Handle Nulls", async function () {
      const deltaOptions = DeltaCommandBase.getDeltaOptions(config);
      deltaOptions.fullCopyDirNames = null;
      expect(DeltaProvider.isFullCopyPath(null, null)).is.false;
      expect(DeltaProvider.isFullCopyPath('', null)).is.false;
      expect(DeltaProvider.isFullCopyPath(null, deltaOptions)).is.false;
    });

    it("Can Identify Full Copy Dir Names", async function () {
      const deltaOptions = DeltaCommandBase.getDeltaOptions(config);
      
      let parts = ['anything', deltaOptions.fullCopyDirNames[0],'something.txt'];
      expect(DeltaProvider.isFullCopyPath(parts.join(path.sep), deltaOptions)).is.true;
      
      parts = ['anything', 'foldername','something.txt'];
      expect(DeltaProvider.isFullCopyPath(parts.join(path.sep), deltaOptions)).is.false;
      
      deltaOptions.fullCopyDirNames = ['foldername'];
      expect(DeltaProvider.isFullCopyPath(parts.join(path.sep), deltaOptions)).is.true;
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
