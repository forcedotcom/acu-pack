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
}
exports.OptionsBase = OptionsBase;
//# sourceMappingURL=options.js.map