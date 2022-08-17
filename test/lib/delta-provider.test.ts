import path = require('path');
import { flags, FlagsConfig } from '@salesforce/command';
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
} as unknown as FlagsConfig;

describe('DeltaProvider Tests', function () {
  describe('getFlagsConfig Tests', function () {
    it('Can Handle Nulls', function () {
      const testFlags = DeltaCommandBase.getFlagsConfig(null);
      expect(testFlags).is.not.null;
      expect(validateFlags(testFlags));
    });

    it('Can Add a Flag', function () {
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

  describe('getDeltaOptions Tests', function () {
    it('Can Handle Nulls', async function () {
      const deltaOptions = await DeltaCommandBase.getDeltaOptions(null);
      expect(deltaOptions).is.not.null;
      expect(deltaOptions.deltaFilePath).is.null;
      expect(deltaOptions.source).is.null;
      expect(deltaOptions.destination).is.null;
      expect(deltaOptions.forceFile).is.null;
      expect(deltaOptions.ignoreFile).is.null;
      expect(deltaOptions.fullCopyDirNames).is.not.null;
    });

    it('Can Parse Config', async function () {
      const deltaOptions = await DeltaCommandBase.getDeltaOptions(config);
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

  describe('fullCopyDirNames Tests', function () {
    it('Can Handle Nulls', async function () {
      const deltaOptions = await DeltaCommandBase.getDeltaOptions(config);
      deltaOptions.fullCopyDirNames = null;
      expect(DeltaProvider.getFullCopyPath(null, null)).is.null;
      expect(DeltaProvider.getFullCopyPath('', null)).is.null;
      expect(DeltaProvider.getFullCopyPath(null, deltaOptions.fullCopyDirNames)).is.null;
    });

    it('Can Identify Full Copy Dir Names', async function () {
      const deltaOptions = await DeltaCommandBase.getDeltaOptions(config);
      
      let parts = ['anything', deltaOptions.fullCopyDirNames[0],'something.txt'];
      expect(DeltaProvider.getFullCopyPath(parts.join(path.sep), deltaOptions.fullCopyDirNames)).is.not.null;
      
      parts = ['anything', 'foldername','something.txt'];
      expect(DeltaProvider.getFullCopyPath(parts.join(path.sep), deltaOptions.fullCopyDirNames)).is.null;
      
      deltaOptions.fullCopyDirNames = ['foldername'];
      expect(DeltaProvider.getFullCopyPath(parts.join(path.sep), deltaOptions.fullCopyDirNames)).is.not.null;
    });

    it('Can Get Full Copy Path', async function () {
      const deltaOptions = await DeltaCommandBase.getDeltaOptions(config);
      
      const partsPath = `anything${path.sep}${deltaOptions.fullCopyDirNames[0]}${path.sep}parent${path.sep}something.txt`;
      expect(DeltaProvider.getFullCopyPath(partsPath, deltaOptions.fullCopyDirNames)).is.not.null;

      const fullCopyPath = DeltaProvider.getFullCopyPath(partsPath,deltaOptions.fullCopyDirNames);
      expect(`anything${path.sep}${deltaOptions.fullCopyDirNames[0]}${path.sep}parent${path.sep}`).equals(fullCopyPath);

      const parts = ['anything', 'foldername','something.txt'];
      const notFullCopyPath = DeltaProvider.getFullCopyPath(parts.join(path.sep),deltaOptions.fullCopyDirNames);
      expect(notFullCopyPath).is.null;
    });
  });

  function validateFlags(flagsConfig: any): void {
    expect(flagsConfig);
    expect(flagsConfig.options);
    expect(flagsConfig.options.char).equals('o');
    expect(flagsConfig.options.required).is.undefined;
    expect(flagsConfig.options.description).is.not.null;

    expect(flagsConfig.source);
    expect(flagsConfig.source.char).equals('s');
    expect(flagsConfig.source.required).is.undefined;
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
