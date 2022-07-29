"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeltaOptions = void 0;
const path = require("path");
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