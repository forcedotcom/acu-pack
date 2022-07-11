"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsBase = exports.OptionsSettings = void 0;
const path = require("path");
const fs_1 = require("fs");
const utils_1 = require("./utils");
const sfdx_core_1 = require("./sfdx-core");
class OptionsSettings {
    constructor() {
        this.ignoreVersion = false;
        this.blockExternalConnections = false;
    }
}
exports.OptionsSettings = OptionsSettings;
class OptionsBase {
    // Make sure we have a default ctor
    constructor() {
        // This field should NOT be serialized see includeField method below
        this.version = 1.0;
        this.prvSettings = new OptionsSettings();
    }
    get settings() {
        return this.prvSettings;
    }
    set settings(optionSettings) {
        if (optionSettings) {
            this.prvSettings = optionSettings;
        }
    }
    get isCurrentVersion() {
        return this.version === this.currentVersion;
    }
    async load(optionsPath) {
        const json = await this.readFile(optionsPath);
        if (!json) {
            await this.loadDefaults();
            if (optionsPath) {
                await this.save(optionsPath);
            }
        }
        else {
            await this.deserialize(json);
            // If we have a filepath AND the version is not current => write the current version
            if (!this.isCurrentVersion && !this.prvSettings.ignoreVersion && optionsPath) {
                this.setCurrentVersion();
                await this.save(optionsPath);
            }
        }
    }
    async save(optionsPath) {
        if (!optionsPath) {
            throw new Error('The optionsPath argument cannot be null.');
        }
        const dir = path.dirname(optionsPath);
        if (dir) {
            await utils_1.default.mkDirPath(dir);
        }
        await fs_1.promises.writeFile(optionsPath, (await this.serialize()));
    }
    ignoreField(fieldName) {
        return fieldName === 'prvSettings';
    }
    deserialize(serializedOptionBase) {
        return new Promise((resolve, reject) => {
            try {
                const options = JSON.parse(serializedOptionBase);
                for (const field of Object.keys(options)) {
                    if (Object.prototype.hasOwnProperty.call(this, field) && !this.ignoreField(field)) {
                        this[field] = options[field];
                    }
                }
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    serialize() {
        // Always check & set the current version before serializing
        if (!this.isCurrentVersion) {
            this.setCurrentVersion();
        }
        const stringify = (key, value) => {
            return (this.ignoreField(key)
                ? undefined
                : value);
        };
        return new Promise((resolve, reject) => {
            try {
                resolve(JSON.stringify(this, stringify, sfdx_core_1.SfdxCore.jsonSpaces));
            }
            catch (err) {
                reject(err);
            }
        });
    }
    async readFile(optionsPath) {
        if (!optionsPath) {
            return null;
        }
        if (await utils_1.default.pathExists(optionsPath)) {
            return (await fs_1.promises.readFile(optionsPath)).toString();
        }
        else {
            return null;
        }
    }
    get currentVersion() {
        return this.version;
    }
    setCurrentVersion() {
        this.version = this.currentVersion;
    }
}
exports.OptionsBase = OptionsBase;
//# sourceMappingURL=options.js.map