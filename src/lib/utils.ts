import path = require('path');
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import xpath = require('xpath');
import { DOMParser as dom } from 'xmldom';

export default class Utils {
    public static async * getFilesAsync(folderPath: string, isRecursive = true) {
        let fileItems;
        // If we have a wildcarded path - lets use glob
        const isGlob = await this.glob.hasMagic(folderPath);
        if (isGlob) {
            fileItems = await this.glob(folderPath);
            for (const filePath of fileItems) {
                yield path.normalize(filePath);
            }
        } else {
            try {
                const stats = await Utils.getPathStat(folderPath);
                // is this a file path?
                if (stats && stats.isFile()) {
                    yield folderPath;
                    return;
                }
                fileItems = await fs.readdir(folderPath);
            } catch (err) {
                if (Utils.isENOENT(err)) {
                    console.log(`WARNING: ${folderPath} not found.`);
                    return;
                }
                throw err;
            }

            for (const fileName of fileItems) {
                const filePath = path.join(folderPath, fileName);
                if ((await fs.stat(filePath)).isDirectory() && isRecursive) {
                    // recurse folders
                    yield* await Utils.getFilesAsync(filePath);
                } else {
                    yield path.normalize(filePath);
                }
            }
        }
    }

    public static async * readFileAsync(filePath: string) {
        if (!(await Utils.pathExistsAsync(filePath))) {
            return;
        }

        const rl = createInterface({
            input: createReadStream(filePath),
            // Note: we use the crlfDelay option to recognize all instances of CR LF
            // ('\r\n') in input.txt as a single line break.
            crlfDelay: Infinity
        });

        // Walk the file
        // @ts-ignore
        for await (const line of rl) {
            yield line;
        }
    }

    public static async pathExistsAsync(pathToCheck: string): Promise<boolean> {
        try {
            await fs.access(pathToCheck);
            return true;
        } catch (err) {
            if (!Utils.isENOENT(err)) {
                throw err;
            }
            return false;
        }
    }

    public static async getPathStat(pathToCheck): Promise<any> {
        return !pathToCheck || !(await Utils.pathExistsAsync(pathToCheck))
            ? null
            : await fs.stat(pathToCheck);
    }

    public static isENOENT(err: any): boolean {
        return err && err.code === 'ENOENT';
    }

    public static async copyFile(source: string, destination: string): Promise<void> {
        try {
            await fs.mkdir(path.dirname(destination), { recursive: true });
            await fs.copyFile(source, destination);
        } catch (err) {
            if (Utils.isENOENT(err)) {
                console.log(`${source} not found.`);
            } else {
                throw err;
            }
        }
    }

    public static sortArray(array: any[]): any[] {
        if (array) {
            array.sort((a, b) => {
                if (typeof a === 'number') {
                    return a - b;
                } else {
                    return a.localeCompare(b, 'en', { sensitivity: 'base' });
                }
            });
        }
        return array;
    }

    public static selectXPath(xml: string, xpaths: string[]): Map<string, string[]> {
        if (!xml || !xpaths || xpaths.length === 0) {
            return null;
        }

        const results = new Map<string, string[]>();
        const doc = new dom().parseFromString(xml);

        for (const xp of xpaths) {
            if (!xp) {
                results.set(xp, null);
                continue;
            }
            const nodes = xpath.select(xp, doc);

            if (!nodes || nodes.length === 0) {
                results.set(xp, null);
                continue;
            }
            const values = [];
            for (const node of nodes) {
                values.push(node.toString());
            }
            results.set(xp, values);
        }
        return results;
    }

    private static glob = require('util').promisify(require('glob'));
}
