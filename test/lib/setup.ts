import Utils from '../../src/lib/utils';
import { promises as fs } from 'fs';
import path = require('path');

export default class Setup {
    public static sourceRoot = "test/source_folder";
    public static destinationRoot = "test/destination_folder";
    public static md5FilePath = "test/md5.test.txt";
    public static gitFilePath = "test/git.test.txt";

    public static async* createTestFiles(folder = Setup.sourceRoot, count = 5) {

        // clean up previous folder & files
        // These files are created at the testing root folder
        await Utils.deleteFileAsync(Setup.md5FilePath);
        await Utils.deleteFileAsync(Setup.gitFilePath);

        // @ts-ignore
        await fs.rmdir(folder, { recursive: true });

        var deltaKind = 'A'
        var myPath = folder;
        await fs.mkdir(myPath, { recursive: true });
        for (let x = 0; x < count; x++) {
            for (let y = 0; y < count; y++) {
                var filePath = path.join(myPath, `myfile${y}.txt`);
                await fs.appendFile(filePath, y + '\r\n');
                await fs.appendFile(Setup.md5FilePath, `${filePath}=${y}\r\n`);
                await fs.appendFile(Setup.gitFilePath, `${deltaKind}\t${filePath}\r\n`);
                deltaKind = deltaKind == 'A' ? 'M' : 'A';
                yield filePath;
            }
            myPath = path.join(myPath, 'sub_' + x);
            await fs.mkdir(myPath, { recursive: true });
        }
    }
}
