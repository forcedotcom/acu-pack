"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestResult = exports.IOItem = exports.RestAction = exports.LoggerLevel = exports.NO_CONTENT_CODE = void 0;
const path = require("path");
const fs_1 = require("fs");
const fs_2 = require("fs");
const readline_1 = require("readline");
const mime = require("mime-types");
const xpath = require("xpath");
const xmldom_1 = require("@xmldom/xmldom");
const xml2js = require("xml2js");
const core_1 = require("@salesforce/core");
const constants_1 = require("./constants");
exports.NO_CONTENT_CODE = 204;
var LoggerLevel;
(function (LoggerLevel) {
    LoggerLevel["trace"] = "trace";
    LoggerLevel["debug"] = "debug";
    LoggerLevel["info"] = "info";
    LoggerLevel["warn"] = "warn";
    LoggerLevel["error"] = "error";
    LoggerLevel["fatal"] = "fatal";
})(LoggerLevel || (exports.LoggerLevel = LoggerLevel = {}));
var RestAction;
(function (RestAction) {
    RestAction["GET"] = "GET";
    RestAction["PUT"] = "PUT";
    RestAction["POST"] = "POST";
    RestAction["DELETE"] = "DELETE";
    RestAction["PATCH"] = "PATCH";
})(RestAction || (exports.RestAction = RestAction = {}));
var IOItem;
(function (IOItem) {
    IOItem["File"] = "File";
    IOItem["Folder"] = "Folder";
    IOItem["Both"] = "Both";
})(IOItem || (exports.IOItem = IOItem = {}));
class RestResult {
    constructor() {
        this.isError = false;
        this.isBinary = false;
    }
    get isRedirect() {
        if (!constants_1.default.HTTP_STATUS_REDIRECT) {
            return false;
        }
        for (const statusCode of constants_1.default.HTTP_STATUS_REDIRECT) {
            if (this.code === statusCode) {
                return true;
            }
        }
        return false;
    }
    get redirectUrl() {
        return this.isRedirect
            ? this.headers?.location
            : null;
    }
    throw() {
        throw this.getError();
    }
    getContent() {
        return this.getError() || this.body || this.id;
    }
    getError() {
        return this.isError ? new Error(`(${this.code}) ${this.body}`) : null;
    }
}
exports.RestResult = RestResult;
class Utils {
    static async log(logMessage, logLevel, isJsonEnabled) {
        if (!this.logger) {
            this.logger = await core_1.Logger.root();
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
    static async *getFiles(folderPath, isRecursive = true) {
        for await (const item of Utils.getItems(folderPath, IOItem.File, isRecursive)) {
            yield item;
        }
    }
    static async *getFolders(folderPath, isRecursive = true) {
        for await (const item of Utils.getItems(folderPath, IOItem.Folder, isRecursive)) {
            yield item;
        }
    }
    static async *getItems(rootPath, itemKind, isRecursive = true, depth = 0) {
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
        if (!stats) {
            /* eslint-disable-next-line no-console */
            console.log(`WARNING: ${rootPath} not found.`);
            return;
        }
        if (stats.isFile()) {
            if (itemKind !== IOItem.Folder && depth !== 0) {
                yield rootPath;
            }
            // Nothing else to do
            return;
        }
        // We are on a folder
        if (itemKind !== IOItem.File && depth !== 0) {
            yield rootPath;
        }
        // Are we recursive or just starting at the root folder
        if (isRecursive || depth === 0) {
            depth++;
            const subItems = await fs_1.promises.readdir(rootPath);
            for (const subItem of subItems) {
                const subItemPath = path.join(rootPath, subItem);
                const subStats = await Utils.getPathStat(subItemPath);
                if (!subStats) {
                    throw new Error('Invalid Path - NO STATS');
                }
                if (subStats.isFile()) {
                    if (itemKind !== IOItem.Folder) {
                        yield Utils.normalizePath(subItemPath);
                    }
                    continue;
                }
                // We are on a folder again 
                if (itemKind !== IOItem.File) {
                    yield Utils.normalizePath(subItemPath);
                }
                if (isRecursive) {
                    for await (const subFilePath of Utils.getItems(subItemPath, itemKind, isRecursive, depth)) {
                        yield subFilePath;
                    }
                }
            }
        }
    }
    static async *readFileLines(filePath) {
        if (!(await Utils.pathExists(filePath))) {
            return;
        }
        const rl = (0, readline_1.createInterface)({
            input: (0, fs_2.createReadStream)(filePath),
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
    static async readFile(filePath, options) {
        if (!(await Utils.pathExists(filePath))) {
            return null;
        }
        return (await fs_1.promises.readFile(filePath, options)).toString();
    }
    static async pathExists(pathToCheck) {
        try {
            await fs_1.promises.access(pathToCheck);
            return true;
        }
        catch (err) {
            if (!Utils.isENOENT(err)) {
                throw err;
            }
            return false;
        }
    }
    static async getPathStat(pathToCheck) {
        return !pathToCheck || !(await Utils.pathExists(pathToCheck)) ? null : await fs_1.promises.stat(pathToCheck);
    }
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    static isENOENT(err) {
        return err && err.code === constants_1.default.ENOENT;
    }
    static async mkDirPath(destination, hasFileName = false) {
        if (!destination) {
            return;
        }
        await fs_1.promises.mkdir(hasFileName ? path.dirname(destination) : destination, { recursive: true });
    }
    static async copyFile(source, destination) {
        try {
            await Utils.mkDirPath(destination, true);
            await fs_1.promises.copyFile(source, destination);
        }
        catch (err) {
            if (Utils.isENOENT(err)) {
                /* eslint-disable-next-line no-console */
                console.log(`${source} not found.`);
            }
            else {
                throw err;
            }
        }
    }
    static sortArray(array) {
        if (array) {
            array.sort((a, b) => {
                if (typeof a === 'number') {
                    return a - b;
                }
                else {
                    return a.localeCompare(b, 'en', { sensitivity: 'base' });
                }
            });
        }
        return array;
    }
    static selectXPath(xml, xpaths) {
        if (!xml || !xpaths || xpaths.length === 0) {
            return null;
        }
        const results = new Map();
        const doc = new xmldom_1.DOMParser().parseFromString(xml);
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
    static async deleteFile(filePath) {
        if (!(await Utils.pathExists(filePath))) {
            return false;
        }
        await fs_1.promises.unlink(filePath);
        return true;
    }
    static async sleep(sleepMiliseconds = 1000) {
        // tslint:disable-next-line no-string-based-set-timeout
        await new Promise((resolve) => setTimeout(resolve, sleepMiliseconds));
    }
    static getFieldValues(records, fieldName = 'id', mustHaveValue = false) {
        const values = [];
        for (const record of records) {
            values.push(Utils.getFieldValue(record, fieldName, mustHaveValue));
        }
        return values;
    }
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    static getFieldValue(record, fieldName = 'id', mustHaveValue = false) {
        if (!record) {
            return null;
        }
        const value = typeof record === 'string' ? record : record[fieldName];
        if (mustHaveValue && !value) {
            throw new Error(`Required Field: ${fieldName} not found in record: ${JSON.stringify(record)}.`);
        }
        return value;
    }
    static unmaskEmail(email, mask = '.invalid') {
        if (!email) {
            return null;
        }
        if (!email.includes(mask)) {
            return email;
        }
        return email.split(mask).join('');
    }
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    static writeObjectToXml(metadata, xmlOptions) {
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
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    static async writeObjectToXmlFile(filePath, metadata, xmlOptions) {
        if (!filePath || !metadata) {
            return null;
        }
        await Utils.mkDirPath(filePath, true);
        const xml = Utils.writeObjectToXml(metadata, xmlOptions);
        await Utils.writeFile(filePath, xml);
        return filePath;
    }
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    static async readObjectFromXmlFile(filePath, xmlOptions) {
        if (!filePath) {
            return null;
        }
        const options = xmlOptions ?? Utils.defaultXmlOptions;
        const xmlString = await fs_1.promises.readFile(filePath, options.encoding);
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
        return await new xml2js.Parser(options).parseStringPromise(xmlString);
    }
    static setCwd(newCwdPath) {
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
    static async deleteDirectory(dirPath) {
        if (await Utils.pathExists(dirPath)) {
            const getFiles = await fs_1.promises.readdir(dirPath);
            if (getFiles) {
                for (const file of getFiles) {
                    await Utils.deleteFile(path.join(dirPath, file));
                }
            }
            await fs_1.promises.rmdir(dirPath);
        }
    }
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    static async writeFile(filePath, contents) {
        await fs_1.promises.writeFile(filePath, contents);
    }
    static chunkRecords(recordsToChunk, chunkSize) {
        const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
        return chunk(recordsToChunk, chunkSize);
    }
    static async getRestResult(action, url, 
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    parameter, 
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    headers, validStatusCodes, isFollowRedirects = true) {
        let result = null;
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
                    case exports.NO_CONTENT_CODE:
                        return result;
                    default:
                        // Read payload
                        /* eslint-disable-next-line camelcase */
                        response.content_type = response.headers[constants_1.default.HEADERS_CONTENT_TYPE];
                        if (response.content_type === constants_1.default.CONTENT_TYPE_APPLICATION) {
                            result.body = Buffer.from(await response.arrayBuffer());
                            result.isBinary = true;
                        }
                        else {
                            result.body = await response.json();
                        }
                        return result;
                }
            }
            catch (err) {
                result.isError = true;
                result.code = err.statusCode;
                result.body = err.message;
                result.headers = err.headers;
                tempUrl = result.redirectUrl;
            }
        } while (isFollowRedirects && result.isRedirect);
        return result;
    }
    static async isDirectory(filePath) {
        return (await fs_1.promises.stat(filePath)).isDirectory();
    }
    static normalizePath(filePath) {
        let newFilePath = filePath;
        if (newFilePath) {
            newFilePath = path.normalize(newFilePath);
            // eslint-disable-next-line @typescript-eslint/quotes
            const regEx = new RegExp(path.sep === '\\' ? '/' : "\\\\", 'g');
            newFilePath = newFilePath.replace(regEx, path.sep);
        }
        return newFilePath;
    }
    static parseDelimitedLine(delimitedLine, delimiter = ',', wrapperChars = constants_1.default.DEFAULT_CSV_TEXT_WRAPPERS, skipChars = [constants_1.default.EOL, constants_1.default.CR, constants_1.default.LF]) {
        if (delimitedLine === null) {
            return null;
        }
        const parts = [];
        let part = null;
        let inWrapper = false;
        const addPart = function (ch) {
            part = part ? part + ch : ch;
            return part;
        };
        let lastChar = null;
        for (const ch of delimitedLine) {
            lastChar = ch;
            if (skipChars.includes(lastChar)) {
                continue;
            }
            if (lastChar === delimiter) {
                if (inWrapper) {
                    addPart(lastChar);
                }
                else {
                    // insert a blank string if part is null
                    parts.push(part);
                    part = null;
                }
                continue;
            }
            // is this part wrapped? (i.e. "this is wrapped, becuase it has the delimiter")
            if (wrapperChars.includes(lastChar)) {
                inWrapper = !inWrapper;
                if (part === null) {
                    part = '';
                }
                continue;
            }
            addPart(lastChar);
        }
        // do we have a trailing part?
        if (part || lastChar === delimiter) {
            parts.push(part);
        }
        return parts;
    }
    static async *parseCSVFile(csvFilePath, delimiter = ',', wrapperChars = constants_1.default.DEFAULT_CSV_TEXT_WRAPPERS) {
        if (csvFilePath === null) {
            return null;
        }
        let headers = null;
        for await (const line of this.readFileLines(csvFilePath)) {
            const parts = this.parseDelimitedLine(line, delimiter, wrapperChars);
            if (!parts) {
                continue;
            }
            if (!headers) {
                headers = parts;
                continue;
            }
            const csvObj = {};
            for (let index = 0; index < headers.length; index++) {
                const header = headers[index];
                csvObj[header] = index < parts.length ? parts[index] : null;
            }
            yield csvObj;
        }
    }
    static getMIMEType(filename) {
        return mime.lookup(filename);
    }
}
Utils.isJsonEnabled = false;
Utils.ReadFileBase64EncodingOption = { encoding: 'base64' };
Utils.TempFilesPath = 'Processing_AcuPack_Temp_DoNotUse';
Utils.defaultXmlOptions = {
    renderOpts: { pretty: true, indent: '    ', newline: '\n' },
    xmldec: { version: '1.0', encoding: 'UTF-8' },
    eofChar: '\n',
    encoding: 'utf-8',
};
Utils.reqUtils = require('util');
Utils.reqGlob = require('glob');
Utils.glob = Utils.reqUtils.promisify(Utils.reqGlob);
Utils.bent = require('bent');
exports.default = Utils;
//# sourceMappingURL=utils.js.map