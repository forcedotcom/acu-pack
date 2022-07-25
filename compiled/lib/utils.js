"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestResult = exports.RestAction = exports.LoggerLevel = exports.NO_CONTENT_CODE = void 0;
const tslib_1 = require("tslib");
const path = require("path");
const fs_1 = require("fs");
const fs_2 = require("fs");
const readline_1 = require("readline");
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
})(LoggerLevel = exports.LoggerLevel || (exports.LoggerLevel = {}));
var RestAction;
(function (RestAction) {
    RestAction["GET"] = "GET";
    RestAction["PUT"] = "PUT";
    RestAction["POST"] = "POST";
    RestAction["DELETE"] = "DELETE";
    RestAction["PATCH"] = "PATCH";
})(RestAction = exports.RestAction || (exports.RestAction = {}));
class RestResult {
    constructor() {
        this.isError = false;
        this.isBinary = false;
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
    static getFiles(folderPath, isRecursive = true) {
        return tslib_1.__asyncGenerator(this, arguments, function* getFiles_1() {
            var e_1, _a;
            let fileItems;
            // If we have a wildcarded path - lets use glob
            const isGlob = yield tslib_1.__await(this.glob.hasMagic(folderPath));
            if (isGlob) {
                fileItems = yield tslib_1.__await(this.glob(folderPath));
                for (const filePath of fileItems) {
                    yield yield tslib_1.__await(path.normalize(filePath));
                }
            }
            else {
                try {
                    const stats = yield tslib_1.__await(Utils.getPathStat(folderPath));
                    // is this a file path?
                    if (stats && stats.isFile()) {
                        yield yield tslib_1.__await(folderPath);
                        return yield tslib_1.__await(void 0);
                    }
                    fileItems = yield tslib_1.__await(fs_1.promises.readdir(folderPath));
                }
                catch (err) {
                    if (Utils.isENOENT(err)) {
                        /* eslint-disable-next-line no-console */
                        console.log(`WARNING: ${folderPath} not found.`);
                        return yield tslib_1.__await(void 0);
                    }
                    throw err;
                }
                for (const fileName of fileItems) {
                    const filePath = path.join(folderPath, fileName);
                    if ((yield tslib_1.__await(fs_1.promises.stat(filePath))).isDirectory() && isRecursive) {
                        try {
                            // recurse folders
                            for (var _b = (e_1 = void 0, tslib_1.__asyncValues(Utils.getFiles(filePath))), _c; _c = yield tslib_1.__await(_b.next()), !_c.done;) {
                                const subFilePath = _c.value;
                                yield yield tslib_1.__await(subFilePath);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) yield tslib_1.__await(_a.call(_b));
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    }
                    else {
                        yield yield tslib_1.__await(path.normalize(filePath));
                    }
                }
            }
        });
    }
    static readFileLines(filePath) {
        return tslib_1.__asyncGenerator(this, arguments, function* readFileLines_1() {
            var e_2, _a;
            if (!(yield tslib_1.__await(Utils.pathExists(filePath)))) {
                return yield tslib_1.__await(void 0);
            }
            const rl = (0, readline_1.createInterface)({
                input: (0, fs_2.createReadStream)(filePath),
                // Note: we use the crlfDelay option to recognize all instances of CR LF
                // ('\r\n') in input.txt as a single line break.
                crlfDelay: Infinity,
            });
            try {
                // Walk the file
                /* eslint-disable @typescript-eslint/ban-ts-comment */
                // @ts-ignore
                for (var rl_1 = tslib_1.__asyncValues(rl), rl_1_1; rl_1_1 = yield tslib_1.__await(rl_1.next()), !rl_1_1.done;) {
                    const line = rl_1_1.value;
                    yield yield tslib_1.__await(line);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (rl_1_1 && !rl_1_1.done && (_a = rl_1.return)) yield tslib_1.__await(_a.call(rl_1));
                }
                finally { if (e_2) throw e_2.error; }
            }
        });
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
        const options = xmlOptions !== null && xmlOptions !== void 0 ? xmlOptions : Utils.defaultXmlOptions;
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
        const options = xmlOptions !== null && xmlOptions !== void 0 ? xmlOptions : Utils.defaultXmlOptions;
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
    headers, validStatusCodes) {
        const result = new RestResult();
        try {
            const apiPromise = Utils.bent(action.toString(), headers || {}, validStatusCodes || [200]);
            const response = await apiPromise(url, parameter);
            // Do we have content?
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
        }
        return result;
    }
}
exports.default = Utils;
Utils.isJsonEnabled = false;
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
//# sourceMappingURL=utils.js.map