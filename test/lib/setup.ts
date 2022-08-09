import { promises as fs } from 'fs';
import path = require('path');
import Utils from '../../src/lib/utils';

export default class Setup {
    public static sourceRoot = 'test/source_folder';
    public static destinationRoot = 'test/destination_folder';
    public static md5FilePath = 'test/md5.test.txt';
    public static gitFilePath = 'test/git.test.txt';
    public static gitExpFilePath = 'test/git-exp.test.txt';
    public static sourceExpRoot = 'test/force-app';
    public static destinationExpRoot = 'test/destination_folder';
    public static orgAlias = null;// '';
    /*
    public static get orgAlias(): Promise<String> {
        return (async () => {
           try {
                const alias = await SfdxTasks.getDefaultOrgAlias();
                if(!alias) {
                    throw new Error('No orgAlias defined - skipping tests.');
                }
                return alias;
            } catch(e) {
                return JSON.stringify(e);  // fallback value
            }
        })();
    }
    */

    public static async* createTestFiles(folder = Setup.sourceRoot, count = 5): AsyncGenerator<string, void, void> {

        // clean up previous folder & files
        // These files are created at the testing root folder
        await Utils.deleteFile(Setup.md5FilePath);
        await Utils.deleteFile(Setup.gitFilePath);

        await Utils.mkDirPath(folder);
        await Utils.mkDirPath(Setup.sourceRoot);
        await Utils.mkDirPath(Setup.destinationRoot);

        /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        await fs.rmdir(folder, { recursive: true });

        let deltaKind = 'A';
        let myPath = folder;
        let filePath: string = null;
        await Utils.mkDirPath(myPath);
        for (let x = 0; x < count; x++) {
            for (let y = 0; y < count; y++) {
                filePath = path.join(myPath, `myfile.${y}.txt`);
                await fs.appendFile(filePath, `${y}\r\n`);
                await fs.appendFile(Setup.md5FilePath, `${filePath}=${y}\r\n`);
                await fs.appendFile(Setup.gitFilePath, `${deltaKind}\t${filePath}\r\n`);
                deltaKind = deltaKind === 'A' ? 'M' : 'A';
                yield filePath;
            }

            myPath = path.join(myPath, `sub_${x}`);
            await Utils.mkDirPath(myPath);
        }

        // Create staticresources folder structure
        filePath = path.join(folder,'folder.resource-meta.xml'); 
        await fs.appendFile(filePath,'1\r\n');
        yield filePath;

        const folderPath = path.join(folder,'folder');
        await Utils.mkDirPath(folderPath);
        
        filePath = path.join(folderPath,'file1.txt'); 
        await fs.appendFile(filePath,'1\r\n');
        yield filePath;

        await fs.appendFile(Setup.md5FilePath, `${filePath}=1\r\n`);
        await fs.appendFile(Setup.gitFilePath, `${deltaKind}\t${filePath}\r\n`);
    }
}
