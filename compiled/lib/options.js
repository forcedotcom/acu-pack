"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsBase = void 0;
const path = require("path");
const utils_1 = require("./utils");
const fs_1 = require("fs");
const sfdx_core_1 = require("./sfdx-core");
class OptionsBase {
    // Make sure we have a default ctor
    constructor() {
        this.version = 1.0;
    }
    get isCurrentVersion() {
        return this.version === this.currentVersion;
    }
    async load(optionsPath, ignoreVersion = false) {
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
            if (!this.isCurrentVersion && !ignoreVersion && optionsPath) {
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
    deserialize(serializedOptionBase) {
        return new Promise((resolve, reject) => {
            try {
                const options = JSON.parse(serializedOptionBase);
                for (const field of Object.keys(options)) {
                    if (this.hasOwnProperty(field)) {
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
        return new Promise((resolve, reject) => {
            try {
                // Always check & set the current version before serializing
                if (!this.isCurrentVersion) {
                    this.setCurrentVersion();
                }
                resolve(JSON.stringify(this, null, sfdx_core_1.SfdxCore.jsonSpaces));
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