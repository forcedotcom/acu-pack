import path = require('path');
import * as xml2js from 'xml2js';
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import xpath = require('xpath');
import { DOMParser as dom } from 'xmldom';
import { Logger } from '@salesforce/core';

export enum LoggerLevel {
    trace = 'trace',
    debug = 'debug',
    info = 'info',
    warn = 'warn',
    error = 'error',
    fatal = 'fatal'
}

export default class Utils {

    public static logger: Logger;
    public static isJsonEnabled = false;

    public static _tempFilesPath: string = 'Processing_AcuPack_Temp_DoNotUse';
    public static defaultXmlOptions = {
        renderOpts: { pretty: true, indent: '    ', newline: '\n' },
        xmldec: { version: '1.0', encoding: 'UTF-8' },
        eofChar: '\n',
        encoding: 'utf-8'
    };
    public static async log(logMessage: string, logLevel: string, isJsonEnabled?: boolean) {

        if (!this.logger) {
            this.logger = await Logger.root();
            this.isJsonEnabled = isJsonEnabled;
        }
        if (!this.isJsonEnabled) {
            switch (logLevel) {
                case LoggerLevel.trace:
                    this.logger.trace(logMessage);
                    break;
                case LoggerLevel.debug:
                    this.logger.debug(logMessage);
                    break;
                case LoggerLevel.info:
                    this.logger.info(logMessage);
                    break;
                case LoggerLevel.warn:
                    this.logger.warn(logMessage);
                    break;
                case LoggerLevel.error:
                    this.logger.error(logMessage);
                    break;
                case LoggerLevel.fatal:
                    this.logger.fatal(logMessage);
                    break;
            }

        }

    }

    public static async * getFiles(folderPath: string, isRecursive = true) {
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
                    yield* await Utils.getFiles(filePath);
                } else {
                    yield path.normalize(filePath);
                }
            }
        }
    }

    public static async * readFileLines(filePath: string) {
        if (!(await Utils.pathExists(filePath))) {
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

    public static async readFile(filePath: string, options?: any): Promise<string> {
        if (!(await Utils.pathExists(filePath))) {
            return null;
        }
        return (await fs.readFile(filePath, options)).toString();
    }

    public static async pathExists(pathToCheck: string): Promise<boolean> {
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
        return !pathToCheck || !(await Utils.pathExists(pathToCheck))
            ? null
            : await fs.stat(pathToCheck);
    }

    public static isENOENT(err: any): boolean {
        return err && err.code === 'ENOENT';
    }

    public static async mkDirPath(destination: string, hasFileName = false): Promise<void> {
        if (!destination) {
            return;
        }
        await fs.mkdir(hasFileName ? path.dirname(destination) : destination, { recursive: true });

    }

    public static async copyFile(source: string, destination: string): Promise<void> {
        try {
            await Utils.mkDirPath(destination, true);
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

    public static async deleteFile(filePath: string): Promise<boolean> {
        if (!(await Utils.pathExists(filePath))) {
            return false;
        }
        await fs.unlink(filePath);
        return true;
    }

    public static async sleep(sleepMiliseconds: number = 1000): Promise<void> {
        // tslint:disable-next-line no-string-based-set-timeout
        await new Promise(resolve => setTimeout(resolve, sleepMiliseconds));
    }

    public static getFieldValues(records: any[], fieldName: string = 'id', mustHaveValue = false): string[] {
        const values = [];
        for (const record of records) {
            values.push(Utils.getFieldValue(record, fieldName, mustHaveValue));
        }
        return values;
    }

    public static getFieldValue(record: any, fieldName: string = 'id', mustHaveValue = false): string {
        if (!record) {
            return null;
        }
        const value = typeof record === 'string'
            ? record
            : record[fieldName];
        if (mustHaveValue && !value) {
            throw new Error(`Required Field: ${fieldName} not found in record: ${JSON.stringify(record)}.`);
        }
        return value;
    }

    public static unmaskEmail(email: string, mask: string = '.invalid'): string {
        if (!email) {
            return null;
        }
        if (!email.includes(mask)) {
            return email;
        }
        return email.split(mask).join('');
    }

    public static writeObjectToXml(metadata: any, xmlOptions?: any): string {
        if (!metadata) {
            return null;
        }
        const options = xmlOptions ?? Utils.defaultXmlOptions;
        let xml = new xml2js.Builder(options).buildObject(metadata);

        if (options.eofChar) {
            xml += options.eofChar;
        }
        return xml;
    }

    public static async writeObjectToXmlFile(filePath: string, metadata: any, xmlOptions?: any): Promise<string> {
        if (!filePath || !metadata) {
            return null;
        }
        await Utils.mkDirPath(filePath, true);
        const xml = Utils.writeObjectToXml(metadata, xmlOptions);
        await Utils.writeFile(filePath, xml);

        return filePath;
    }

    public static async readObjectFromXmlFile(filePath: string, xmlOptions?: any): Promise<any> {
        if (!filePath) {
            return null;
        }
        const options = xmlOptions ?? Utils.defaultXmlOptions;
        const xmlString = await fs.readFile(filePath, options.encoding);

        return await (new xml2js.Parser(options).parseStringPromise((xmlString)));
    }

    public static setCwd(newCwdPath: string): string {
        if (!newCwdPath) {
            return null;
        }
        const currentCwd = path.resolve(process.cwd());
        const newCwd = path.resolve(newCwdPath);
        if (currentCwd !== newCwd) {
            process.chdir(newCwdPath);
        }
        return currentCwd;
    }

    public static async deleteDirectory(dirPath: string) {
        if (Utils.pathExists(dirPath)) {
            const getFiles = await fs.readdir(dirPath);
            if (getFiles) {
                for (const file of getFiles) {
                    await Utils.deleteFile(path.join(dirPath, file));
                }
            }

            await fs.rmdir(dirPath);
        }
    }

    public static async writeFile(filePath: string, contents: any): Promise<void> {
        await fs.writeFile(filePath, contents);
    }

    public static  chunkRecords(recordsToChunk: any[], chunkSize: number): any[] {
        const chunk = (arr, size) =>
          Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
            arr.slice(i * size, i * size + size)
          );
        return chunk(recordsToChunk, chunkSize);
    }

    private static glob = require('util').promisify(require('glob'));

}
