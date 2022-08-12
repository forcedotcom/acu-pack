"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeltaOptions = void 0;
const utils_1 = require("../lib/utils");
const delta_command_1 = require("./delta-command");
const options_1 = require("./options");
class DeltaOptions extends options_1.OptionsBase {
    constructor() {
        super(...arguments);
        this.deltaFilePath = null;
        this.source = null;
        this.destination = null;
        this.deleteReportFile = null;
        this.forceFile = null;
        this.ignoreFile = null;
        this.isDryRun = false;
        this.fullCopyDirNames = delta_command_1.DeltaCommandBase.defaultCopyDirList;
        this.logAllMessagesToConsole = false;
    }
    normalize() {
        if (this.deltaFilePath) {
            this.deltaFilePath = utils_1.default.normalizePath(this.deltaFilePath);
        }
        if (this.source) {
            this.source = utils_1.default.normalizePath(this.source);
        }
        if (this.destination) {
            this.destination = utils_1.default.normalizePath(this.destination);
        }
        if (this.deleteReportFile) {
            this.deleteReportFile = utils_1.default.normalizePath(this.deleteReportFile);
        }
        if (this.forceFile) {
            this.forceFile = utils_1.default.normalizePath(this.forceFile);
        }
        if (this.ignoreFile) {
            this.ignoreFile = utils_1.default.normalizePath(this.ignoreFile);
        }
    }
    loadDefaults() {
        return new Promise((resolve, reject) => {
            try {
                this.deltaFilePath = '';
                this.source = '';
                this.destination = '';
                this.deleteReportFile = '';
                this.forceFile = '';
                this.ignoreFile = '';
                this.isDryRun = false;
                this.fullCopyDirNames = delta_command_1.DeltaCommandBase.defaultCopyDirList;
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    get currentVersion() {
        return DeltaOptions.CURRENT_VERSION;
    }
}
exports.DeltaOptions = DeltaOptions;
DeltaOptions.CURRENT_VERSION = 1.0;
//# sourceMappingURL=delta-options.js.map