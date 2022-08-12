import path = require('path');
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import xpath = require('xpath');
import { DOMParser as dom } from '@xmldom/xmldom';
import * as xml2js from 'xml2js';
import { Logger } from '@salesforce/core';
import Constants from './constants';

export const NO_CONTENT_CODE = 204;

export enum LoggerLevel {
  trace = 'trace',
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error',
  fatal = 'fatal',
}

export enum RestAction {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export class RestResult {
  public id: string;
  public code: number;
  public body: any;
  public isError = false;
  public contentType: string;
  public isBinary = false;

  public throw(): Error {
    throw this.getError();
  }

  public getContent(): any {
    return this.getError() || this.body || this.id;
  }

  private getError(): Error {
    return this.isError ? new Error(`(${this.code}) ${this.body as string}`) : null;
  }
}

export default class Utils {
  public static logger: Logger;
  public static isJsonEnabled = false;

  public static TempFilesPath = 'Processing_AcuPack_Temp_DoNotUse';
  public static defaultXmlOptions = {
    renderOpts: { pretty: true, indent: '    ', newline: '\n' },
    xmldec: { version: '1.0', encoding: 'UTF-8' },
    eofChar: '\n',
    encoding: 'utf-8',
  };

  private static reqUtils = require('util');
  private static reqGlob = require('glob');
  private static glob = Utils.reqUtils.promisify(Utils.reqGlob);
  private static bent = require('bent');

  public static async log(logMessage: string, logLevel: string, isJsonEnabled?: boolean): Promise<void> {
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

  public static async *getFiles(folderPath: string, isRecursive = true): AsyncGenerator<string, void, void> {
    let fileItems;
    // If we have a wildcarded path - lets use glob
    const isGlob = await this.glob.hasMagic(folderPath);
    if (isGlob) {
      fileItems = await this.glob(folderPath);
      for (const filePath of fileItems) {
        yield Utils.normalizePath(filePath);
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
          /* eslint-disable-next-line no-console */
          console.log(`WARNING: ${folderPath} not found.`);
          return;
        }
        throw err;
      }

      for (const fileName of fileItems) {
        const filePath = path.join(folderPath, fileName);
        if ((await fs.stat(filePath)).isDirectory()) {
          // recurse folders
          if(isRecursive) {
            for await (const subFilePath of Utils.getFiles(filePath, isRecursive)) {
              yield subFilePath;
            }
          }
          continue;
        } else {
          yield Utils.normalizePath(filePath);
        }
      }
    }
  }

  public static async *readFileLines(filePath: string): AsyncGenerator<string, void, void> {
    if (!(await Utils.pathExists(filePath))) {
      return;
    }

    const rl = createInterface({
      input: createReadStream(filePath),
      // Note: we use the crlfDelay option to recognize all instances of CR LF
      // ('\r\n') in input.txt as a single line break.
      crlfDelay: Infinity,
    });

    // Walk the file
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    for await (const line of rl) {
      yield line;
    }
  }

  /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
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

  public static async getPathStat(pathToCheck: string): Promise<any> {
    return !pathToCheck || !(await Utils.pathExists(pathToCheck)) ? null : await fs.stat(pathToCheck);
  }

  /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
  public static isENOENT(err: any): boolean {
    return err && err.code === Constants.ENOENT;
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
        /* eslint-disable-next-line no-console */
        console.log(`${source} not found.`);
      } else {
        throw err;
      }
    }
  }

  public static sortArray(array: any[]): any[] {
    if (array) {
      array.sort((a: any, b: any): number => {
        if (typeof a === 'number') {
          return a - b;
        } else {
          return a.localeCompare(b, 'en', { sensitivity: 'base' }) as number;
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

  public static async sleep(sleepMiliseconds = 1000): Promise<void> {
    // tslint:disable-next-line no-string-based-set-timeout
    await new Promise((resolve) => setTimeout(resolve, sleepMiliseconds));
  }

  public static getFieldValues(records: any[], fieldName = 'id', mustHaveValue = false): string[] {
    const values: string[] = [];
    for (const record of records) {
      values.push(Utils.getFieldValue(record, fieldName, mustHaveValue));
    }
    return values;
  }

  /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
  public static getFieldValue(record: any, fieldName = 'id', mustHaveValue = false): string {
    if (!record) {
      return null;
    }
    const value: string = typeof record === 'string' ? record : record[fieldName];
    if (mustHaveValue && !value) {
      throw new Error(`Required Field: ${fieldName} not found in record: ${JSON.stringify(record)}.`);
    }
    return value;
  }

  public static unmaskEmail(email: string, mask = '.invalid'): string {
    if (!email) {
      return null;
    }
    if (!email.includes(mask)) {
      return email;
    }
    return email.split(mask).join('');
  }

  /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
  public static writeObjectToXml(metadata: any, xmlOptions?: any): string {
    if (!metadata) {
      return null;
    }
    const options = xmlOptions ?? Utils.defaultXmlOptions;
    let xml: string = new xml2js.Builder(options).buildObject(metadata);

    if (options.eofChar) {
      xml += options.eofChar;
    }
    return xml;
  }

  /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
  public static async writeObjectToXmlFile(filePath: string, metadata: any, xmlOptions?: any): Promise<string> {
    if (!filePath || !metadata) {
      return null;
    }
    await Utils.mkDirPath(filePath, true);
    const xml = Utils.writeObjectToXml(metadata, xmlOptions);
    await Utils.writeFile(filePath, xml);

    return filePath;
  }

  /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
  public static async readObjectFromXmlFile(filePath: string, xmlOptions?: any): Promise<any> {
    if (!filePath) {
      return null;
    }
    const options = xmlOptions ?? Utils.defaultXmlOptions;
    const xmlString = await fs.readFile(filePath, options.encoding);

    /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
    return await new xml2js.Parser(options).parseStringPromise(xmlString);
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

  public static async deleteDirectory(dirPath: string): Promise<void> {
    if (await Utils.pathExists(dirPath)) {
      const getFiles = await fs.readdir(dirPath);
      if (getFiles) {
        for (const file of getFiles) {
          await Utils.deleteFile(path.join(dirPath, file));
        }
      }

      await fs.rmdir(dirPath);
    }
  }

  /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
  public static async writeFile(filePath: string, contents: any): Promise<void> {
    await fs.writeFile(filePath, contents);
  }

  public static chunkRecords(recordsToChunk: any[], chunkSize: number): any[] {
    const chunk = (arr: any[], size: number): any[] =>
      Array.from({ length: Math.ceil(arr.length / size) }, (v: any, i: number): any[] =>
        arr.slice(i * size, i * size + size)
      );
    return chunk(recordsToChunk, chunkSize);
  }

  public static async getRestResult(
    action: RestAction,
    url: string,
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    parameter?: any,
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    headers?: any,
    validStatusCodes?: []
  ): Promise<RestResult> {
    const result = new RestResult();

    try {
      const apiPromise = Utils.bent(action.toString(), headers || {}, validStatusCodes || [200]);
      const response = await apiPromise(url, parameter);

      // Do we have content?
      result.code = response.statusCode;
      switch (result.code) {
        case NO_CONTENT_CODE:
          return result;
        default:
          // Read payload
          /* eslint-disable-next-line camelcase */
          response.content_type = response.headers[Constants.HEADERS_CONTENT_TYPE];
          if (response.content_type === Constants.CONTENT_TYPE_APPLICATION) {
            result.body = Buffer.from(await response.arrayBuffer());
            result.isBinary = true;
          } else {
            result.body = await response.json();
          }

          return result;
      }
    } catch (err) {
      result.isError = true;
      result.code = err.statusCode;
      result.body = err.message;
    }
    return result;
  }

  public static async isDirectory(filePath: string): Promise<boolean> {
    return (await fs.stat(filePath)).isDirectory();
  }

  public static normalizePath(filePath: string): string {
    let newFilePath = filePath;
    if(newFilePath) {
      newFilePath = path.normalize(newFilePath);

      const regEx = new RegExp(path.sep === '\\' ? '/' : '\\\\','g');
      newFilePath = newFilePath.replace(regEx, path.sep);
    }
    return newFilePath;
  }
}
