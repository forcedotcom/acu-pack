"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const xml2js = require("xml2js");
const fs_1 = require("fs");
const fs_2 = require("fs");
const readline_1 = require("readline");
const xpath = require("xpath");
const xmldom_1 = require("xmldom");
class Utils {
    static getFilesAsync(folderPath, isRecursive = true) {
        return tslib_1.__asyncGenerator(this, arguments, function* getFilesAsync_1() {
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
                        console.log(`WARNING: ${folderPath} not found.`);
                        return yield tslib_1.__await(void 0);
                    }
                    throw err;
                }
                for (const fileName of fileItems) {
                    const filePath = path.join(folderPath, fileName);
                    if ((yield tslib_1.__await(fs_1.promises.stat(filePath))).isDirectory() && isRecursive) {
                        // recurse folders
                        yield tslib_1.__await(yield* tslib_1.__asyncDelegator(tslib_1.__asyncValues(yield tslib_1.__await(Utils.getFilesAsync(filePath)))));
                    }
                    else {
                        yield yield tslib_1.__await(path.normalize(filePath));
                    }
                }
            }
        });
    }
    static readFileAsync(filePath) {
        return tslib_1.__asyncGenerator(this, arguments, function* readFileAsync_1() {
            var e_1, _a;
            if (!(yield tslib_1.__await(Utils.pathExistsAsync(filePath)))) {
                return yield tslib_1.__await(void 0);
            }
            const rl = readline_1.createInterface({
                input: fs_2.createReadStream(filePath),
                // Note: we use the crlfDelay option to recognize all instances of CR LF
                // ('\r\n') in input.txt as a single line break.
                crlfDelay: Infinity
            });
            try {
                // Walk the file
                // @ts-ignore
                for (var rl_1 = tslib_1.__asyncValues(rl), rl_1_1; rl_1_1 = yield tslib_1.__await(rl_1.next()), !rl_1_1.done;) {
                    const line = rl_1_1.value;
                    yield yield tslib_1.__await(line);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (rl_1_1 && !rl_1_1.done && (_a = rl_1.return)) yield tslib_1.__await(_a.call(rl_1));
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
    static async pathExistsAsync(pathToCheck) {
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
        return !pathToCheck || !(await Utils.pathExistsAsync(pathToCheck))
            ? null
            : await fs_1.promises.stat(pathToCheck);
    }
    static isENOENT(err) {
        return err && err.code === 'ENOENT';
    }
    static async copyFile(source, destination) {
        try {
            await fs_1.promises.mkdir(path.dirname(destination), { recursive: true });
            await fs_1.promises.copyFile(source, destination);
        }
        catch (err) {
            if (Utils.isENOENT(err)) {
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
    static async deleteFileAsync(filePath) {
        if (!(await Utils.pathExistsAsync(filePath))) {
            return false;
        }
        await fs_1.promises.unlink(filePath);
        return true;
    }
    static async sleep(sleepMiliseconds = 1000) {
        // tslint:disable-next-line no-string-based-set-timeout
        await new Promise(resolve => setTimeout(resolve, sleepMiliseconds));
    }
    static getFieldValues(records, fieldName = 'id', mustHaveValue = false) {
        const values = [];
        for (const record of records) {
            values.push(Utils.getFieldValue(record, fieldName, mustHaveValue));
        }
        return values;
    }
    static getFieldValue(record, fieldName = 'id', mustHaveValue = false) {
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
    static unmaskEmail(email, mask = '.invalid') {
        if (!email) {
            return null;
        }
        if (!email.includes(mask)) {
            return email;
        }
        return email.split(mask).join('');
    }
    static async writeObjectToXmlFile(filename, metadata, xmlOptions) {
        if (!filename || !metadata) {
            return null;
        }
        const options = (xmlOptions !== null && xmlOptions !== void 0 ? xmlOptions : Utils.defaultXmlOptions);
        let xml = new xml2js.Builder(options).buildObject(metadata);
        if (options.eofChar) {
            xml += options.eofChar;
        }
        await fs_1.promises.writeFile(filename, xml);
        return filename;
    }
    static async readObjectFromXmlFile(filePath, xmlOptions) {
        if (!filePath) {
            return null;
        }
        const options = (xmlOptions !== null && xmlOptions !== void 0 ? xmlOptions : Utils.defaultXmlOptions);
        const xmlString = await fs_1.promises.readFile(filePath, options.encoding);
        return await (new xml2js.Parser(options).parseStringPromise((xmlString)));
    }
}
exports.default = Utils;
Utils.defaultXmlOptions = {
    renderOpts: { pretty: true, indent: '    ', newline: '\n' },
    xmldec: { version: '1.0', encoding: 'UTF-8' },
    eofChar: '\n',
    encoding: 'utf-8'
};
Utils.glob = require('util').promisify(require('glob'));
//# sourceMappingURL=utils.js.map