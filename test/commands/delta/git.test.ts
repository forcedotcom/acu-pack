import { promises as fs } from 'fs';
import { expect } from '@salesforce/command/lib/test';
import Setup from '../../lib/setup';
import { DeltaOptions } from '../../../src/lib/delta-options';
import Utils from '../../../src/lib/utils';
import Git from '../../../src/commands/acu-pack/source/delta/git';

const bogusGitFilePath = 'bogus_' + Setup.gitFilePath;
const gitProvider = new Git.gitDeltaProvider();
let testFilesCreated = 0;

beforeEach(async () => {
  testFilesCreated = 0;
  for await (const testFile of Setup.createTestFiles(Setup.sourceRoot)) {
    expect(testFile).is.not.null;
    testFilesCreated++;
  }
  expect(testFilesCreated).to.be.greaterThan(0);
  if (await Utils.pathExists(bogusGitFilePath)) {
    await fs.unlink(bogusGitFilePath);
  }
  gitProvider.deltas.clear();
});
describe('GitDeltaProvider Tests', function () {
  it('Has Name', function () {
    expect(gitProvider.name).equals('git');
  });

  it('Has deltaLineToken', function () {
    expect(gitProvider.deltaLineToken).equals('\t');
  });

  describe('loadDeltaFile Tests', function () {
    it('Can handle null', async function () {
      expect(gitProvider.deltas.size).equals(0);
      await gitProvider.loadDeltaFile(null);
      expect(gitProvider.deltas.size).equals(0);
    });
    it('Can load git diff file', async function () {
      expect(gitProvider.deltas.size).equals(0);
      await gitProvider.loadDeltaFile(Setup.gitFilePath);
      expect(gitProvider.deltas.size).not.equals(0);
    });
    it("Can't handle missing git diff file", async function () {
      expect(gitProvider.deltas.size).equals(0);
      await gitProvider.loadDeltaFile(bogusGitFilePath);
      expect(gitProvider.deltas.size).equals(0);
    });
  });

  describe('diff Tests', function () {
    it('Can NOT build missing git file', async function () {
      expect(gitProvider.deltas.size).equals(0);

      gitProvider.deltaOptions.deltaFilePath = bogusGitFilePath;
      await gitProvider.loadDeltaFile();

      const diffSet = new Set();
      for await (const diff of gitProvider.diff(Setup.sourceRoot)) {
        diffSet.add(diff);
      }
      expect(diffSet.size).equals(0);
    });
    it('Can diff', async function () {
      expect(gitProvider.deltas.size).equals(0);

      gitProvider.deltaOptions.deltaFilePath = Setup.gitFilePath;
      await gitProvider.loadDeltaFile();

      const diffSet = new Set();
      for await (const diff of gitProvider.diff(Setup.sourceRoot)) {
        diffSet.add(diff);
      }
      expect(diffSet.size).not.equals(0);
      expect(diffSet.size).equals(gitProvider.deltas.size);
    });
    it('Can run', async function () {
      const deltaOptions = new DeltaOptions();
      deltaOptions.deltaFilePath = Setup.gitFilePath;
      deltaOptions.source = Setup.sourceRoot;
      deltaOptions.destination = Setup.destinationRoot;

      const metrics = await gitProvider.run(deltaOptions);

      expect(metrics.Copy).equals(testFilesCreated);
    });
  });
  describe('validateDeltaOptions Tests', function () {
    it('Checks missing minimum required', async function () {
      const deltaOptions = new DeltaOptions();

      // NOT OK
      expect(await gitProvider.validateDeltaOptions(deltaOptions)).to.equal(
        'No delta -g(it) file specified or specified file does not exist.'
      );

      // NOT OK
      deltaOptions.deltaFilePath = Setup.gitFilePath;
      expect(await gitProvider.validateDeltaOptions(deltaOptions)).to.equal('No delta -s(ource) specified.');

      // OK
      deltaOptions.source = Setup.sourceRoot;
      expect(await gitProvider.validateDeltaOptions(deltaOptions)).to.be.null;

      // OK
      deltaOptions.destination = Setup.destinationRoot;
      expect(await gitProvider.validateDeltaOptions(deltaOptions)).to.be.null;

      // OK
      deltaOptions.forceFile = 'force.txt';
      expect(await gitProvider.validateDeltaOptions(deltaOptions)).to.be.null;

      // OK
      deltaOptions.ignoreFile = 'ignore.txt';
      expect(await gitProvider.validateDeltaOptions(deltaOptions)).to.be.null;

      // OK
      deltaOptions.deleteReportFile = 'delete.txt';
      expect(await gitProvider.validateDeltaOptions(deltaOptions)).to.be.null;
    });
  });
  describe('Full Folder Copy Tests', function () {
    beforeEach(async () => {
      /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
      // @ts-ignore
      await fs.rmdir(Setup.destinationRoot, { recursive: true });
      await Utils.mkDirPath(Setup.destinationRoot);
    });
    it('Copies files correctly', async function () {
      
      const deltaOptions = new DeltaOptions();
      deltaOptions.deltaFilePath = Setup.gitFullDirFilePath;
      deltaOptions.source = Setup.sourceForceAppRoot;
      deltaOptions.destination = Setup.destinationRoot;

      await gitProvider.run(deltaOptions);

      let filesCount = 0;
      for await (const filePath of Utils.getFiles(Setup.destinationRoot)) {
        if (filePath) {
            filesCount++;
        }
      }

      expect(17).equals(filesCount);

    });
  });
});
