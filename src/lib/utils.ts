import path = require('path');
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import mime = require('mime-types');
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
  PATCH = 'PATCH'
}

export enum IOItem {
  File = 'File',
  Folder = 'Folder',
  Both = 'Both',
}

export class RestResult {
  public id: string;
  public code: number;
  public body: any;
  public isError = false;
  public contentType: string;
  public isBinary = false;
  public headers: any;
  
  public get isRedirect(): boolean {
    if(!Constants.HTTP_STATUS_REDIRECT) {
      return false;
    }
    for(const statusCode of Constants.HTTP_STATUS_REDIRECT) {
      if(this.code === statusCode) {
        return true;
      }
    }
    return false;
  }

  public get redirectUrl(): string {
    return this.isRedirect
      ? this.headers?.location as string
      : null;
  }

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
  public static ReadFileBase64EncodingOption = {encoding: 'base64'};

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
    for await ( const item of Utils.getItems(folderPath,IOItem.File,isRecursive)) {
      yield item;
    }
  }

  public static async *getFolders(folderPath: string, isRecursive = true): AsyncGenerator<string, void, void> {
    for await ( const item of Utils.getItems(folderPath,IOItem.Folder,isRecursive)) {
      yield item;
    }
  }

  public static async *getItems(rootPath: string, itemKind: IOItem, isRecursive = true, depth = 0): AsyncGenerator<string, void, void> {
    let fileItems;
    // If we have a wildcarded path - lets use glob
    const isGlob = await this.glob.hasMagic(rootPath);
    if (isGlob) {
      // Globs should be specific so just return
      fileItems = await this.glob(rootPath);
      for (const filePath of fileItems) {
        yield Utils.normalizePath(filePath);
      }
      return;
    }

    const stats = await Utils.getPathStat(rootPath);
    if(!stats) {
      /* eslint-disable-next-line no-console */
      console.log(`WARNING: ${rootPath} not found.`);
      return;
    }

    if(stats.isFile()) {
      if(itemKind !== IOItem.Folder && depth !== 0) {
        yield rootPath;
      }
      // Nothing else to do
      return;
    } 
    // We are on a folder
    if(itemKind !== IOItem.File && depth !== 0) {
      yield rootPath;
    }
    // Are we recursive or just starting at the root folder
    if(isRecursive || depth === 0) {
      depth++;
      const subItems = await fs.readdir(rootPath);
      for (const subItem of subItems) {
        const subItemPath = path.join(rootPath, subItem);
        const subStats = await Utils.getPathStat(subItemPath);
        if(!subStats) {
          throw new Error('Invalid Path - NO STATS');
        }
        if(subStats.isFile()) {
          if(itemKind !== IOItem.Folder) {
            yield Utils.normalizePath(subItemPath);
          }
          continue;
        }
        // We are on a folder again 
        if(itemKind !== IOItem.File) {
          yield Utils.normalizePath(subItemPath);
        }
        if(isRecursive) {
          for await (const subFilePath of Utils.getItems(subItemPath, itemKind, isRecursive, depth)) {
            yield subFilePath;
          }
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
    validStatusCodes?: number[],
    isFollowRedirects = true
  ): Promise<RestResult> {
    let result: RestResult = null;
    const apiPromise = Utils.bent(action.toString(), headers || {}, validStatusCodes || [200]);
    let tempUrl = url;
    do {
      result = new RestResult();
      try {
        const response = await apiPromise(tempUrl, parameter);
        // Do we have content?
        result.headers = response.headers;
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
        result.headers = err.headers;
        tempUrl = result.redirectUrl;
      }
    } while(isFollowRedirects && result.isRedirect)
    return result;
  }

  public static async isDirectory(filePath: string): Promise<boolean> {
    return (await fs.stat(filePath)).isDirectory();
  }

  public static normalizePath(filePath: string): string {
    let newFilePath = filePath;
    if(newFilePath) {
      newFilePath = path.normalize(newFilePath);

      // eslint-disable-next-line @typescript-eslint/quotes
      const regEx = new RegExp(path.sep === '\\' ? '/' : "\\\\",'g');
      newFilePath = newFilePath.replace(regEx, path.sep);
    }
    return newFilePath;
  }

  public static parseDelimitedLine(delimitedLine: string, delimiter = ',', wrapperChars = Constants.DEFAULT_CSV_TEXT_WRAPPERS, skipChars = [Constants.EOL, Constants.CR, Constants.LF]): string[] {
    if(delimitedLine === null) {
      return null;
    }
    const parts: string[] = [];
    let part: string = null;
    let inWrapper = false;
    const addPart = function(ch: string): string {
      part = part  ? part + ch : ch;
      return part;
    }
    let lastChar: string = null;
    for(const ch of delimitedLine) {
      lastChar = ch;
      if(skipChars.includes(lastChar)) {
        continue;
      }
      if(lastChar === delimiter) {
        if(inWrapper) {
          addPart(lastChar);
        } else {
          // insert a blank string if part is null
          parts.push(part);
          part = null;
        }
        continue;
      }
      // is this part wrapped? (i.e. "this is wrapped, becuase it has the delimiter")
      if(wrapperChars.includes(lastChar)){
        inWrapper = !inWrapper;
        if(part === null) {
          part = '';
        }
        continue;
      }
      addPart(lastChar);
    }
    // do we have a trailing part?
    if(part || lastChar === delimiter) {
      parts.push(part);
    }
    return parts;
  }

  public static async* parseCSVFile(csvFilePath: string, delimiter = ',', wrapperChars = Constants.DEFAULT_CSV_TEXT_WRAPPERS): AsyncGenerator<any, void, void> {
    if(csvFilePath === null) {
      return null;
    }

    let headers: string[] = null;
    
    for await (const line of this.readFileLines(csvFilePath)) {
      const parts = this.parseDelimitedLine(line,delimiter,wrapperChars);
      if(!parts) {
        continue;        
      }
      if(!headers) {
        headers = parts
        continue;
      }
      const csvObj = {};
      for(let index = 0; index < headers.length; index++) {
        const header = headers[index];
        csvObj[header] = index < parts.length ? parts[index] :  null;
      }
      yield csvObj;

    }
  }

  public static getMIMEType(filename: string): string {
    return mime.lookup(filename) as string;
  }
}
