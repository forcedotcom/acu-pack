import Setup from './setup'
import { promises as fs } from 'fs';
import { expect } from '@salesforce/command/lib/test';
import Utils from '../../src/lib/utils'
import path = require('path');

const testItemCount = 5
var testFilePath = undefined;
beforeEach(async () => {
    for await (const testFile of Setup.createTestFiles(Setup.sourceRoot, testItemCount)) {
        // Do test specific stuff here?
        if (!testFilePath) {
            testFilePath = testFile;
        }
    }
});
describe("Utils Tests", function () {
    const bogusPath = 'bogus_path';
    describe("getFilesAsync Test", function () {
        it("Can find files", async function () {
            const files = [];
            for await (const file of Utils.getFilesAsync(Setup.sourceRoot)) {
                files.push(file);
            }
            expect(files.length).equal(testItemCount * testItemCount);
        });
        it("Can Handle Missing Folders", async function () {
            var files = [];
            for await (const file of Utils.getFilesAsync(bogusPath)) {
                files.push(file);
            }
            expect(files.length).equal(0);
        });
        it("Can Handle File Path", async function () {
            var files = [];
            for await (const file of Utils.getFilesAsync(testFilePath)) {
                files.push(file);
            }
            expect(files.length).equal(1);
            expect(files[0]).equal(testFilePath);
        });
    });
    describe("readFileAsync Test", function () {
        var testFilePath = `${Setup.sourceRoot}/readFileAsyncTest.txt`;
        var testFileLineCount = 25;
        beforeEach(async function () {
            for (let index = 0; index < testFileLineCount; index++) {
                await fs.appendFile(testFilePath, `${index}\r\n`);
            }
        });
        it("Can read file", async function () {
            var lines = [];
            for await (const file of Utils.readFileAsync(testFilePath)) {
                lines.push(file);
            }
            expect(lines.length).equal(testFileLineCount);
        });
        it("Can Handle Missing Files", async function () {
            var lines = [];
            for await (const file of Utils.readFileAsync(bogusPath)) {
                lines.push(file);
            }
            expect(lines.length).equal(0);
        });
    });
    describe("pathExistsAsync Test", function () {
        it("Can find file", async function () {
            expect((await Utils.pathExistsAsync(testFilePath)));
        });
        it("Can Handle Missing Files", async function () {
            expect((await Utils.pathExistsAsync(bogusPath))).false;
        });
    });
    describe("isENOENT Test", function () {
        it("isENOENT", async function () {
            try {
                await fs.open(bogusPath, 'r');
                expect.fail('Should not see this.');
            } catch (err) {
                expect(Utils.isENOENT(err)).true;
            }
        });
    });
    describe("copyFile Test", function () {
        it("Can copy file", async function () {
            var destination = path.join(Setup.destinationRoot, path.basename(testFilePath));
            await Utils.copyFile(testFilePath, destination)
            var isSuccess = await Utils.pathExistsAsync(destination);
            expect(isSuccess).true;
        });
    });
    describe("getPathStat Test", function () {
        it("Can can handle null", async function () {
            expect((await Utils.getPathStat(null))).null;
        });
        it("Can Handle Missing Path", async function () {
            expect((await Utils.getPathStat(bogusPath))).null;
        });
        it("Can Handle Files", async function () {
            var stats = await Utils.getPathStat(testFilePath);
            expect(stats).not.null;
            expect(stats.isFile()).true;
        });
        it("Can Handle Folders", async function () {
            var stats = await Utils.getPathStat(Setup.sourceRoot);
            expect(stats).not.null;
            expect(stats.isDirectory()).true;
        });
    });
    describe("sortArray Test", function () {
        it("Can handle null", async function () {
            const sortedArray = Utils.sortArray(null);
            expect(sortedArray).equal(null);
        });
        it("Can Handle Numbers", async function () {
            const sortedArray = Utils.sortArray([4, 3, 2, 1, 0]);
            expect(sortedArray.join(',')).equal([0, 1, 2, 3, 4].join(','));
        });
        it("Can Handle Strings", async function () {
            const sortedArray = Utils.sortArray(['4', '3', '2', '1', '0']);
            expect(sortedArray.join(',')).equal(['0', '1', '2', '3', '4'].join(','));
        });
        it("Can Handle Empty", async function () {
            const sortedArray = Utils.sortArray([]);
            expect(sortedArray.join(',')).equal([].join(','));
        });
    });
    describe("selectXPath Tests", function () {
        const xml = '<root><node index="0">data0</node><node1 index="0">data0</node1><node index="1">data1</node></root>'
        const xpath = '//root/node/text()';
        it("Can handle nulls", function () {
            expect(Utils.selectXPath(null, null)).to.equal(null);
            expect(Utils.selectXPath(xml, null)).to.equal(null);
            expect(Utils.selectXPath(null, [])).to.equal(null);
            expect(Utils.selectXPath(xml, [])).to.equal(null);
            expect(Utils.selectXPath(xml, [xpath])).to.not.equal(null);
        });
        it("Can find nodes", function () {
            const xpath2 = "//node[@index='1']";
            const results = Utils.selectXPath(xml, [xpath2]);
            expect(results.size).to.equal(1);
            expect(results.get(xpath2).length).to.equal(1);
            expect(results.get(xpath2)[0]).to.equal('<node index="1">data1</node>');
        });
        it("Can find node values", function () {
            const results = Utils.selectXPath(xml, [xpath]);
            expect(results.size).to.equal(1);
            expect(results.get(xpath).length).to.equal(2);
            expect(results.get(xpath)[0]).to.equal('data0');
            expect(results.get(xpath)[1]).to.equal('data1');
        });
    });
    describe("unmaskEmail Tests", function () {
        it("Can handle nulls", function () {
            expect(Utils.unmaskEmail(null)).to.equal(null);
        });
        it("Can unmaskEmail", function () {
            expect(Utils.unmaskEmail('test.user@aie.army.com.soqldev.invalid')).to.equal('test.user@aie.army.com.soqldev');
        });
        it("Does not change unmasked email", function () {
            expect(Utils.unmaskEmail('test.user@aie.army.com.soqldev')).to.equal('test.user@aie.army.com.soqldev');
        });
    });
});
