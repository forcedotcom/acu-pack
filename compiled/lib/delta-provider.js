"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeltaProvider = exports.DeltaOptions = exports.Delta = void 0;
const tslib_1 = require("tslib");
const command_1 = require("@salesforce/command");
const utils_1 = require("./utils");
const fs_1 = require("fs");
const path = require("path");
class Delta {
    constructor(deltaKind, deltaFile) {
        this.deltaKind = deltaKind;
        this.deltaFile = deltaFile;
    }
}
exports.Delta = Delta;
class DeltaOptions {
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
    getFlagsConfig(flagsConfig) {
        if (!flagsConfig) {
            flagsConfig = {};
        }
        if (!flagsConfig.source) {
            flagsConfig.source = command_1.flags.filepath({
                char: 's',
                required: true,
                description: this.getMessage('source.delta.sourceFlagDescription')
            });
        }
        if (!flagsConfig.destination) {
            flagsConfig.destination = command_1.flags.filepath({
                char: 'd',
                description: this.getMessage('source.delta.destinationFlagDescription')
            });
        }
        if (!flagsConfig.force) {
            flagsConfig.force = command_1.flags.filepath({
                char: 'f',
                description: this.getMessage('source.delta.forceFlagDescription')
            });
        }
        if (!flagsConfig.ignore) {
            flagsConfig.ignore = command_1.flags.filepath({
                char: 'i',
                description: this.getMessage('source.delta.ignoreFlagDescription')
            });
        }
        if (!flagsConfig.deletereport) {
            flagsConfig.deletereport = command_1.flags.filepath({
                char: 'r',
                description: this.getMessage('source.delta.deleteReportFlagDescription')
            });
        }
        if (!flagsConfig.check) {
            flagsConfig.check = command_1.flags.boolean({
                char: 'c',
                description: this.getMessage('source.delta.checkFlagDescription')
            });
        }
        return flagsConfig;
    }
    async run(deltaOptions) {
        var e_1, _a, e_2, _b, e_3, _c, e_4, _d, e_5, _e, e_6, _f;
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
                    for (var _g = tslib_1.__asyncValues(utils_1.default.readFileLines(ignoreFile)), _h; _h = await _g.next(), !_h.done;) {
                        const line = _h.value;
                        try {
                            for (var _j = (e_2 = void 0, tslib_1.__asyncValues(utils_1.default.getFiles(line))), _k; _k = await _j.next(), !_k.done;) {
                                const filePath = _k.value;
                                ignoreSet.add(path.normalize(filePath));
                                await this.logMessage(`\t${filePath}`);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_k && !_k.done && (_b = _j.return)) await _b.call(_j);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_h && !_h.done && (_a = _g.return)) await _a.call(_g);
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
                        for (var _l = tslib_1.__asyncValues(utils_1.default.readFileLines(forceFile)), _m; _m = await _l.next(), !_m.done;) {
                            const line = _m.value;
                            try {
                                for (var _o = (e_4 = void 0, tslib_1.__asyncValues(utils_1.default.getFiles(line))), _p; _p = await _o.next(), !_p.done;) {
                                    const filePath = _p.value;
                                    if (this.deltas.delete(filePath)) {
                                        await this.logMessage(`Purged: ${filePath}`, true);
                                    }
                                }
                            }
                            catch (e_4_1) { e_4 = { error: e_4_1 }; }
                            finally {
                                try {
                                    if (_p && !_p.done && (_d = _o.return)) await _d.call(_o);
                                }
                                finally { if (e_4) throw e_4.error; }
                            }
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (_m && !_m.done && (_c = _l.return)) await _c.call(_l);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                }
            }
            await this.logMessage(`Scanning folder: ${source}.`, true);
            try {
                for (var _q = tslib_1.__asyncValues(this.diff(source)), _r; _r = await _q.next(), !_r.done;) {
                    const delta = _r.value;
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
                            try {
                                // check the source folder for associated files.
                                for (var _s = (e_6 = void 0, tslib_1.__asyncValues(utils_1.default.getFiles(path.dirname(deltaFile), false))), _t; _t = await _s.next(), !_t.done;) {
                                    const filePath = _t.value;
                                    // have we already processed this file?
                                    if (copiedSet.has(filePath)) {
                                        continue;
                                    }
                                    if (path.basename(filePath).startsWith(`${path.basename(deltaFile).split('.')[0]}`)) {
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
                                    }
                                }
                            }
                            catch (e_6_1) { e_6 = { error: e_6_1 }; }
                            finally {
                                try {
                                    if (_t && !_t.done && (_f = _s.return)) await _f.call(_s);
                                }
                                finally { if (e_6) throw e_6.error; }
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
                    if (_r && !_r.done && (_e = _q.return)) await _e.call(_q);
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
        var e_7, _a;
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
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
                }
                finally { if (e_7) throw e_7.error; }
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