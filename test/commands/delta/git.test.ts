import Setup from '../../lib/setup';
import { promises as fs } from 'fs';
import { expect } from '@salesforce/command/lib/test';
import Utils from '../../../src/lib/utils'
import Git from '../../../src/commands/acumen/source/delta/git'
import { DeltaOptions } from '../../../src/lib/delta-provider'

const bogusGitFilePath = 'bogus_' + Setup.gitFilePath;
const gitProvider = new Git.gitDeltaProvider();

beforeEach(async () => {
    for await (const testFile of Setup.createTestFiles(Setup.sourceRoot)) {
        console.log(`created: ${testFile}`);
    }

    if (await Utils.pathExistsAsync(bogusGitFilePath)) {
        await fs.unlink(bogusGitFilePath);
    }
    gitProvider.deltas.clear();
});
describe("GitDeltaProvider Tests", function () {
    it("Has Name", async function () {
        expect(gitProvider.name).equals('git');
    });

    it("Has deltaLineToken", async function () {
        expect(gitProvider.deltaLineToken).equals('\t');
    });

    describe("loadDeltaFileAsync Tests", function () {
        it("Can handle null", async function () {
            expect(gitProvider.deltas.size).equals(0);
            await gitProvider.loadDeltaFileAsync(null);
            expect(gitProvider.deltas.size).equals(0);
        });
        it("Can load git diff file", async function () {
            expect(gitProvider.deltas.size).equals(0);
            await gitProvider.loadDeltaFileAsync(Setup.gitFilePath);
            expect(gitProvider.deltas.size).not.equals(0);
        });
        it("Can't handle missing git diff file", async function () {
            expect(gitProvider.deltas.size).equals(0);
            await gitProvider.loadDeltaFileAsync(bogusGitFilePath);
            expect(gitProvider.deltas.size).equals(0);
        });
    });

    describe("diffAsync Tests", function () {
        it("Can NOT build missing git file", async function () {
            expect(gitProvider.deltas.size).equals(0);
            
            gitProvider.deltaOptions.deltaFilePath = bogusGitFilePath;
            await gitProvider.loadDeltaFileAsync();

            const diffSet = new Set();
            for await (const diff of gitProvider.diffAsync( Setup.sourceRoot)) {
                diffSet.add(diff);
            }
            expect(diffSet.size).equals(0);
        });
        it("Can diff", async function () {
            expect(gitProvider.deltas.size).equals(0);
            
            gitProvider.deltaOptions.deltaFilePath = Setup.gitFilePath;
            await gitProvider.loadDeltaFileAsync();

            const diffSet = new Set();
            for await (const diff of gitProvider.diffAsync(Setup.sourceRoot)) {
                diffSet.add(diff);
            }
            // since there was no hash file - there were no deltas returned as they are all new
            expect(diffSet.size).not.equals(0);
            // we should have hash entries though
            expect(diffSet.size).equals(gitProvider.deltas.size);
        });
    });
    describe("validateDeltaOptionsAsync Tests", function () {
        it("Checks missing minimum required", async function () {
            const deltaOptions = new DeltaOptions();
            
            // NOT OK
            expect(await gitProvider.validateDeltaOptionsAsync(deltaOptions)).to.equal('No delta -g(it) file specified or specified file does not exist.');

            // NOT OK
            deltaOptions.deltaFilePath = Setup.gitFilePath;
            expect(await gitProvider.validateDeltaOptionsAsync(deltaOptions)).to.equal('No delta -s(ource) specified.');
            
            // OK
            deltaOptions.source = Setup.sourceRoot;
            expect(await gitProvider.validateDeltaOptionsAsync(deltaOptions)).to.be.null;

            // OK
            deltaOptions.destination = Setup.destinationRoot;
            expect(await gitProvider.validateDeltaOptionsAsync(deltaOptions)).to.be.null;

            // OK
            deltaOptions.forceFile = 'force.txt';
            expect(await gitProvider.validateDeltaOptionsAsync(deltaOptions)).to.be.null;

            // OK
            deltaOptions.ignoreFile = 'ignore.txt';
            expect(await gitProvider.validateDeltaOptionsAsync(deltaOptions)).to.be.null;

            // OK
            deltaOptions.deleteReportFile = 'delete.txt';
            expect(await gitProvider.validateDeltaOptionsAsync(deltaOptions)).to.be.null;
        });
    });
});
