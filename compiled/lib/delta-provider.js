"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
const fs_1 = require("fs");
const path = require("path");
const delta_command_1 = require("./delta-command");
class Delta {
    constructor(deltaKind, deltaFile) {
        this.deltaKind = deltaKind;
        this.deltaFile = deltaFile;
    }
}
exports.Delta = Delta;
class DeltaOptions {
    constructor() {
        this.fullCopyDirNames = delta_command_1.DeltaCommandBase.defaultCopyDirList;
    }
    normalize() {
        if (this.deltaFilePath) {
            this.deltaFilePath = path.normalize(this.deltaFilePath);
        }
        if (this.source) {
            this.source = path.normalize(this.source);
        }
        if (this.destination) {
            this.destination = path.normalize(this.destination);
        }
        if (this.deleteReportFile) {
            this.deleteReportFile = path.normalize(this.deleteReportFile);
        }
        if (this.forceFile) {
            this.forceFile = path.normalize(this.forceFile);
        }
        if (this.ignoreFile) {
            this.ignoreFile = path.normalize(this.ignoreFile);
        }
    }
}
exports.DeltaOptions = DeltaOptions;
class DeltaProvider {
    constructor() {
        this.logFile = 'delta.log';
        this.deltaOptions = new DeltaOptions();
    }
    static isFullCopyPath(filePath, deltaOptions) {
        if (filePath && deltaOptions) {
            for (const dirName of deltaOptions.fullCopyDirNames) {
                if (filePath.includes(`${path.sep}${dirName}${path.sep}`)) {
                    return true;
                }
            }
        }
        return false;
    }
    async run(deltaOptions) {
        var e_1, _a, e_2, _b, e_3, _c, e_4, _d, e_5, _e, e_6, _f, e_7, _g;
        if (!deltaOptions) {
            throw new Error('No DeltaOptions specified.');
        }
        else {
            this.deltaOptions = deltaOptions;
            this.deltaOptions.normalize();
        }
        // Reset log file
        await utils_1.default.deleteFile(this.logFile);
        const metrics = {
            Copy: 0,
            Del: 0,
            None: 0,
            Ign: 0
        };
        try {
            // Validate flags/options
            const result = await this.validateDeltaOptions(deltaOptions);
            if (result) {
                throw new Error(result);
            }
            // Make sure all the paths are normalized (windows vs linux)
            const source = deltaOptions.source;
            const destination = deltaOptions.destination;
            const deleteReportFile = deltaOptions.deleteReportFile;
            const forceFile = deltaOptions.forceFile;
            const ignoreFile = deltaOptions.ignoreFile;
            const isDryRun = deltaOptions.isDryRun;
            const ignoreSet = new Set();
            const copiedSet = new Set();
            // Create Deleted Report File
            if (deleteReportFile && destination) {
                try {
                    // write the deleted-files.txt report into the parent folder of the destination
                    // Reset log file
                    await utils_1.default.deleteFile(deleteReportFile);
                }
                catch (err) {
                    if (!utils_1.default.isENOENT(err)) {
                        await this.logMessage(`Unable to delete old report: ${err.message}.`);
                    }
                }
            }
            if (ignoreFile) {
                await this.logMessage('Ignore Set:');
                try {
                    for (var _h = tslib_1.__asyncValues(utils_1.default.readFileLines(ignoreFile)), _j; _j = await _h.next(), !_j.done;) {
                        const line = _j.value;
                        try {
                            for (var _k = tslib_1.__asyncValues(utils_1.default.getFiles(line)), _l; _l = await _k.next(), !_l.done;) {
                                const filePath = _l.value;
                                ignoreSet.add(path.normalize(filePath));
                                await this.logMessage(`\t${filePath}`);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_l && !_l.done && (_b = _k.return)) await _b.call(_k);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_j && !_j.done && (_a = _h.return)) await _a.call(_h);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            if (!this.diff) {
                await this.logMessage('Unable to find a diff method.', true);
                return;
            }
            if (isDryRun) {
                await this.logMessage(`Begin DRY-RUN Diff (${this.name})`);
            }
            else {
                await this.logMessage(`Begin Diff (${this.name})`);
            }
            // try and load the delta file
            await this.loadDeltaFile();
            if (forceFile) {
                if (this.deltas.size > 0) {
                    // Remove the force entries from the hash so they
                    // 'act' like new files and are copiied to the destination.
                    await this.logMessage('Puring force file entries from deltas.', true);
                    try {
                        for (var _m = tslib_1.__asyncValues(utils_1.default.readFileLines(forceFile)), _o; _o = await _m.next(), !_o.done;) {
                            const line = _o.value;
                            try {
                                for (var _p = tslib_1.__asyncValues(utils_1.default.getFiles(line)), _q; _q = await _p.next(), !_q.done;) {
                                    const filePath = _q.value;
                                    if (this.deltas.delete(filePath)) {
                                        await this.logMessage(`Purged: ${filePath}`, true);
                                    }
                                }
                            }
                            catch (e_4_1) { e_4 = { error: e_4_1 }; }
                            finally {
                                try {
                                    if (_q && !_q.done && (_d = _p.return)) await _d.call(_p);
                                }
                                finally { if (e_4) throw e_4.error; }
                            }
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (_o && !_o.done && (_c = _m.return)) await _c.call(_m);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                }
            }
            await this.logMessage(`Scanning folder: ${source}.`, true);
            try {
                for (var _r = tslib_1.__asyncValues(this.diff(source)), _s; _s = await _r.next(), !_s.done;) {
                    const delta = _s.value;
                    const deltaKind = delta.deltaKind;
                    const deltaFile = delta.deltaFile;
                    // No destination? no need to continue
                    if (!destination) {
                        continue;
                    }
                    if (ignoreSet.has(deltaFile)) {
                        await this.logMessage(`Delta (${deltaKind}) ignored: ${deltaFile}`, true);
                        metrics.Ign++;
                        continue;
                    }
                    // Determine the action
                    switch (deltaKind) {
                        // [D]eleted files
                        case DeltaProvider.deltaTypeKind.D:
                            await this.logMessage(`DELETED File: ${deltaFile}`);
                            if (deleteReportFile) {
                                await fs_1.promises.appendFile(deleteReportFile, deltaFile + '\r\n');
                            }
                            metrics.Del++;
                            break;
                        // [A]dded & [M]odified files
                        case DeltaProvider.deltaTypeKind.A:
                        case DeltaProvider.deltaTypeKind.M:
                            // check the source folder for associated files.
                            const dirName = path.dirname(deltaFile);
                            const deltaFileBaseName = `${path.basename(deltaFile).split('.')[0]}.`;
                            let foundCount = 0;
                            try {
                                for (var _t = tslib_1.__asyncValues(utils_1.default.getFiles(dirName, false)), _u; _u = await _t.next(), !_u.done;) {
                                    const filePath = _u.value;
                                    // have we already processed this file?
                                    if (copiedSet.has(filePath)) {
                                        continue;
                                    }
                                    if (DeltaProvider.isFullCopyPath(dirName, deltaOptions) || path.basename(filePath).startsWith(deltaFileBaseName)) {
                                        // are we ignoring this file?
                                        if (ignoreSet.has(filePath)) {
                                            await this.logMessage(`Delta (${deltaKind}) ignored: ${filePath}`, true);
                                            metrics.Ign++;
                                        }
                                        else {
                                            const destinationPath = filePath.replace(source, destination);
                                            if (!isDryRun) {
                                                await utils_1.default.copyFile(filePath, destinationPath);
                                            }
                                            await this.logMessage(`Delta (${deltaKind}) found: ${destinationPath}`);
                                            metrics.Copy++;
                                            copiedSet.add(filePath);
                                        }
                                        foundCount++;
                                    }
                                }
                            }
                            catch (e_6_1) { e_6 = { error: e_6_1 }; }
                            finally {
                                try {
                                    if (_u && !_u.done && (_f = _t.return)) await _f.call(_t);
                                }
                                finally { if (e_6) throw e_6.error; }
                            }
                            if (foundCount === 1) {
                                // Sometimes the meta-data files can be located in the parent dir (staticresources & documents)
                                // so let's check there
                                const parentDirName = path.dirname(dirName);
                                const deltaParentBaseName = `${path.basename(dirName)}.`;
                                try {
                                    for (var _v = tslib_1.__asyncValues(utils_1.default.getFiles(parentDirName, false)), _w; _w = await _v.next(), !_w.done;) {
                                        const parentFilePath = _w.value;
                                        // have we already processed this file?
                                        if (copiedSet.has(parentFilePath)) {
                                            continue;
                                        }
                                        // are we ignoring this file?
                                        if (ignoreSet.has(parentFilePath)) {
                                            await this.logMessage(`Delta (${deltaKind}) ignored: ${parentFilePath}`, true);
                                            metrics.Ign++;
                                            continue;
                                        }
                                        if (path.basename(parentFilePath).startsWith(deltaParentBaseName)) {
                                            const destinationPath = parentFilePath.replace(source, destination);
                                            if (!isDryRun) {
                                                await utils_1.default.copyFile(parentFilePath, destinationPath);
                                            }
                                            await this.logMessage(`Delta (${deltaKind}) found: ${destinationPath}`);
                                            metrics.Copy++;
                                            copiedSet.add(parentFilePath);
                                            foundCount++;
                                        }
                                    }
                                }
                                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                                finally {
                                    try {
                                        if (_w && !_w.done && (_g = _v.return)) await _g.call(_v);
                                    }
                                    finally { if (e_7) throw e_7.error; }
                                }
                            }
                            break;
                        case DeltaProvider.deltaTypeKind.NONE:
                            await this.logMessage(`Delta (${deltaKind}): ${deltaFile}`);
                            metrics.None++;
                            break;
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_s && !_s.done && (_e = _r.return)) await _e.call(_r);
                }
                finally { if (e_5) throw e_5.error; }
            }
            await this.logMessage(`Metrics: ${JSON.stringify(metrics)}`, true);
        }
        catch (err) {
            await this.logMessage(err, true);
        }
        finally {
            await this.logMessage('Done', true);
        }
        return metrics;
    }
    async loadDeltaFile(deltaFilePath) {
        var e_8, _a;
        // only load the hash once
        deltaFilePath = deltaFilePath ? path.normalize(deltaFilePath) : this.deltaOptions.deltaFilePath;
        if (deltaFilePath && this.deltas.size === 0) {
            await this.logMessage(`Loading delta file: ${deltaFilePath}`);
            try {
                for (var _b = tslib_1.__asyncValues(utils_1.default.readFileLines(deltaFilePath)), _c; _c = await _b.next(), !_c.done;) {
                    const line = _c.value;
                    if (!line || !line.trim()) {
                        continue;
                    }
                    if (line.indexOf(this.deltaLineToken) === -1) {
                        await this.logMessage(`Skipping invalid line: ${line}`, true);
                        continue;
                    }
                    this.processDeltaLine(line);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
                }
                finally { if (e_8) throw e_8.error; }
            }
            await this.logMessage(`Loaded delta file: ${deltaFilePath} with ${this.deltas.size} entries.`);
        }
    }
    async logMessage(message, includeConsole = false) {
        if (typeof message === 'string') {
            await fs_1.promises.appendFile(this.logFile, `${message}\r\n`);
        }
        else {
            await fs_1.promises.appendFile(this.logFile, `${JSON.stringify(message)}\r\n`);
        }
        if (includeConsole) {
            console.log(message);
        }
    }
    async validateDeltaOptions(deltaOptions) {
        if (!deltaOptions.source) {
            return 'No delta -s(ource) specified.';
        }
        return null;
    }
}
exports.DeltaProvider = DeltaProvider;
DeltaProvider.deltaTypeKind = {
    NONE: 'NONE',
    A: 'A',
    M: 'M',
    D: 'D'
};
//# sourceMappingURL=delta-provider.js.map