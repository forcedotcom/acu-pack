import os = require('os');
import path = require('path');
import { promises as fs } from 'fs';
import { expect } from '@salesforce/command/lib/test';
import Utils from '../../src/lib/utils';
import Setup from './setup'

let testItemCount = 0;
let testFilePath;
const testObject = { test: true };
beforeEach(async () => {
    testItemCount = 0;
    for await (const testFile of Setup.createTestFiles(Setup.sourceRoot)) {
        // Do test specific stuff here?
        testItemCount++;
        if (!testFilePath) {
            testFilePath = testFile;
        }
    }
});
describe('Utils Tests', function () {
    const bogusPath = 'bogus_path';
    describe('getFiles Test', function () {
        it('Can find files', async function () {
            const files = [];
            for await (const file of Utils.getFiles(Setup.sourceRoot)) {
                files.push(file);
            }
            expect(files.length).equal(testItemCount);
        });
        it('Can Handle Missing Folders', async function () {
            const files = [];
            for await (const file of Utils.getFiles(bogusPath)) {
                files.push(file);
            }
            expect(files.length).equal(0);
        });
        it('Can Handle File Path', async function () {
            const files = [];
            for await (const file of Utils.getFiles(testFilePath)) {
                files.push(file);
            }
            expect(files.length).equal(1);
            expect(files[0]).equal(testFilePath);
        });
    });
    describe('readFileLines Test', function () {
        const testFilePathTest = `${Setup.sourceRoot}/readFileLinesTest.txt`;
        const testFileLineCount = 25;
        beforeEach(async function () {
            for (let index = 0; index < testFileLineCount; index++) {
                await fs.appendFile(testFilePathTest, `${index}${os.EOL}`);
            }
        });
        it('Can read file', async function () {
            const lines = [];
            for await (const file of Utils.readFileLines(testFilePathTest)) {
                lines.push(file);
            }
            expect(lines.length).equal(testFileLineCount);
        });
        it('Can Handle Missing Files', async function () {
            const lines = [];
            for await (const file of Utils.readFileLines(bogusPath)) {
                lines.push(file);
            }
            expect(lines.length).equal(0);
        });
    });
    describe('pathExists Test', function () {
        it('Can find file', async function () {
            expect((await Utils.pathExists(testFilePath)));
        });
        it('Can Handle Missing Files', async function () {
            expect((await Utils.pathExists(bogusPath))).false;
        });
    });
    describe('isENOENT Test', function () {
        it('isENOENT', async function () {
            try {
                await fs.open(bogusPath, 'r');
                expect.fail('Should not see this.');
            } catch (err) {
                expect(Utils.isENOENT(err)).true;
            }
        });
    });
    describe('copyFile Test', function () {
        it('Can copy file', async function () {
            const destination = path.join(Setup.destinationRoot, path.basename(testFilePath));
            await Utils.copyFile(testFilePath, destination)
            const isSuccess = await Utils.pathExists(destination);
            expect(isSuccess).true;
        });
    });
    describe('getPathStat Test', function () {
        it('Can can handle null', async function () {
            expect((await Utils.getPathStat(null))).null;
        });
        it('Can Handle Missing Path', async function () {
            expect((await Utils.getPathStat(bogusPath))).null;
        });
        it('Can Handle Files', async function () {
            const stats = await Utils.getPathStat(testFilePath);
            expect(stats).not.null;
            expect(stats.isFile()).true;
        });
        it('Can Handle Folders', async function () {
            const stats = await Utils.getPathStat(Setup.sourceRoot);
            expect(stats).not.null;
            expect(stats.isDirectory()).true;
        });
    });
    describe('sortArray Test', function () {
        it('Can handle null', function () {
            const sortedArray = Utils.sortArray(null);
            expect(sortedArray).equal(null);
        });
        it('Can Handle Numbers', function () {
            const sortedArray = Utils.sortArray([4, 3, 2, 1, 0]);
            expect(sortedArray.join(',')).equal([0, 1, 2, 3, 4].join(','));
        });
        it('Can Handle Strings', function () {
            const sortedArray = Utils.sortArray(['4', '3', '2', '1', '0']);
            expect(sortedArray.join(',')).equal(['0', '1', '2', '3', '4'].join(','));
        });
        it('Can Handle Empty', function () {
            const sortedArray = Utils.sortArray([]);
            expect(sortedArray.join(',')).equal([].join(','));
        });
    });
    describe('selectXPath Tests', function () {
        const xml = "<root><node index='0'>data0</node><node1 index='0'>data0</node1><node index='1'>data1</node></root>";
        const xpath = '//root/node/text()';
        it('Can handle nulls', function () {
            expect(Utils.selectXPath(null, null)).to.equal(null);
            expect(Utils.selectXPath(xml, null)).to.equal(null);
            expect(Utils.selectXPath(null, [])).to.equal(null);
            expect(Utils.selectXPath(xml, [])).to.equal(null);
            expect(Utils.selectXPath(xml, [xpath])).to.not.equal(null);
        });
        it('Can find nodes', function () {
            const xpath2 = "//node[@index='1']";
            const results = Utils.selectXPath(xml, [xpath2]);
            expect(results.size).to.equal(1);
            expect(results.get(xpath2).length).to.equal(1);
            expect(results.get(xpath2)[0]).to.equal('<node index="1">data1</node>');
        });
        it('Can find node values', function () {
            const results = Utils.selectXPath(xml, [xpath]);
            expect(results.size).to.equal(1);
            expect(results.get(xpath).length).to.equal(2);
            expect(results.get(xpath)[0]).to.equal('data0');
            expect(results.get(xpath)[1]).to.equal('data1');
        });
    });
    describe('unmaskEmail Tests', function () {
        it('Can handle nulls', function () {
            expect(Utils.unmaskEmail(null)).to.equal(null);
        });
        it('Can unmaskEmail', function () {
            expect(Utils.unmaskEmail('test.user@aie.army.com.soqldev.invalid')).to.equal('test.user@aie.army.com.soqldev');
        });
        it('Does not change unmasked email', function () {
            expect(Utils.unmaskEmail('test.user@aie.army.com.soqldev')).to.equal('test.user@aie.army.com.soqldev');
        });
    });
    describe('writeObjectToXmlFile Test', function () {
        const testFilePathTest = `${Setup.sourceRoot}/writeObjectToXmlFileTest.txt`;
        beforeEach(async function () {
            await Utils.deleteFile(testFilePathTest);
        });
        it('Can Handle Null', async function () {
            let result = await Utils.writeObjectToXmlFile(null, null, null);
            expect(result).equal(null);

            result = await Utils.writeObjectToXmlFile(null, null);
            expect(result).equal(null);

            result = await Utils.writeObjectToXmlFile(null, {});
            expect(result).equal(null);

        });
        it('Can Write File', async function () {
            const result = await Utils.writeObjectToXmlFile(testFilePathTest, testObject);
            expect(result).to.not.equal(null);
            const exists = await Utils.pathExists(result);
            expect(exists).to.be.true;
        });
    });
    describe('readObjectFromXmlFile Test', function () {
        const testFilePathTest = `${Setup.sourceRoot}/readObjectFromXmlFileTest.txt`;
        beforeEach(async function () {
            await fs.appendFile(testFilePathTest, `<?xml version='1.0' encoding='UTF-8' standalone='yes'?><root><test>true</test></root>`);
        });
        it('Can Handle Null', async function () {
            let result = await Utils.readObjectFromXmlFile(null, null);
            expect(result).equal(null);

            result = await Utils.readObjectFromXmlFile(null);
            expect(result).equal(null);

        });
        it('Can Read File', async function () {
            const result = await Utils.readObjectFromXmlFile(testFilePathTest);
            expect(result).to.not.equal(null);
            expect(result.root.test[0]).to.equal('true');
        });
    });
    describe('setCwd Test', function () {
        it('Can Handle Null', function () {
            expect(Utils.setCwd(null)).equal(null);

        });
        it('Can Set Absolute Current Working Directory', function () {
            const testCwd = path.resolve(path.dirname(testFilePath));
            const cwd = process.cwd();
            const result = Utils.setCwd(testCwd);
            expect(result).equal(cwd);
            expect(process.cwd()).equal(testCwd);
        });
        it('Can Set Relative Current Working Directory', function () {
            const testCwd = path.dirname(testFilePath);
            const fillTestCwd = path.resolve(testCwd);
            const cwd = process.cwd();
            const result = Utils.setCwd(testCwd);
            expect(result).equal(path.resolve(cwd));
            expect(process.cwd()).equal(fillTestCwd);
        });
        it('Does not change Current Working Directory is same', function () {
            const cwd = process.cwd();
            const result = Utils.setCwd(cwd);
            expect(result).equal(cwd);
        });
    });
    describe('mkDirPath Test', function () {
        const testDirPath = 'testDir1\\testDir2'
        const testDirFilePath = `${testDirPath}}\\testFile.txt`
        afterEach(async () => {
            if ((await Utils.pathExists(testDirPath))) {
                await fs.rmdir(testDirPath);
            }
        });
        it('Can Handle Null', async function () {
            expect(await Utils.mkDirPath(null)).to.be.undefined;
            expect(await Utils.mkDirPath(null, null)).to.be.undefined;
            expect(await Utils.mkDirPath(null, true)).to.be.undefined;
        });
        it('Can Make Absolute Directory Path', async function () {
            const fullPath = path.join(process.cwd(), testDirPath);

            let exists = await Utils.pathExists(fullPath);
            expect(exists).to.be.false;

            await Utils.mkDirPath(fullPath);

            exists = await Utils.pathExists(fullPath);
            expect(exists).to.be.true;
        });
        it('Can Make Relative Directory Path', async function () {
            const fullPath = path.join(process.cwd(), testDirPath);

            let exists = await Utils.pathExists(fullPath);
            expect(exists).to.be.false;

            await Utils.mkDirPath(testDirPath);

            exists = await Utils.pathExists(fullPath);
            expect(exists).to.be.true;
        });
        it('Can Handle Paths with File Names', async function () {
            const fullPath = path.join(process.cwd(), testDirFilePath);

            let exists = await Utils.pathExists(fullPath);
            expect(exists).to.be.false;

            await Utils.mkDirPath(fullPath, true);

            // The file does not exist
            exists = await Utils.pathExists(fullPath);
            expect(exists).to.be.false;

            // but the folder does
            exists = await Utils.pathExists(path.dirname(fullPath));
            expect(exists).to.be.true;
        });
    }); 
    describe('Chunk Array test', function () {
        it('Chunk Array based on chunksize', function () {
            expect(Utils.chunkRecords(['1','2','3','4'],2)).to.eql([['1','2'],['3','4']]);
        });
    });
    describe('normalizePath Test', function () {
        it('Can handle nulls', function () {
            const filePath: string = null;
            expect(Utils.normalizePath(filePath)).to.equal(filePath);
        });
        it('Can Normalize Paths', function () {
            const unixSep = '/';
            const winSep = '\\';
            const pathParts = ['one','two','three','four','five'];
            const isWin = path.sep === '\\';

            const filePath = pathParts.join(isWin ? unixSep : winSep);
            const normFilePath = Utils.normalizePath(filePath);

            expect(normFilePath).to.not.include(isWin ? unixSep : winSep);
        });
    });
});
