import { expect } from '@salesforce/command/lib/test';
import { Office } from '../../src/lib/office'
import Utils from '../../src/lib/utils';

const testFilePath = './output.test.xlsx';
const data = new Map<string, string[][]>();

before('Cleanup', async () => {
    await Utils.deleteFile(testFilePath);
    data.set('book', [['row1col1', 'row1col2'],['row2col1','row2col2'],['row3col1','row3col2']]);
});
after('Cleanup', async () => {
    await Utils.deleteFile(testFilePath);
});
describe('Office Tests', function () {
    describe('writeXlxsWorkbook Test', function () {
        it('Throws on Nulls', function () {
            expect(Office.writeXlxsWorkbook.bind(null,null,null)).to.throw('workboodMap cannot be null.');
        });
        it('Throws on Null Data', function () {
            expect(Office.writeXlxsWorkbook.bind(null,null,testFilePath)).to.throw('workboodMap cannot be null.');
        });
        it('Throws on Null Path', function () {
            expect(Office.writeXlxsWorkbook.bind(null,data,null)).to.throw('xlxsFilePath cannot be null.');
        });
        it('Throws on invalid file extensions', function () {
            expect(Office.writeXlxsWorkbook.bind(null,data,'./invalid.file.extension.test')).to.throw('Unrecognized bookType |test|');
        });
        it('Writes XLXS File', async function () {
            Office.writeXlxsWorkbook(data, testFilePath);
            expect(await Utils.pathExists(testFilePath)).to.be.true;
        });
    });
});
