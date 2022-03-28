"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("./options");
const sfdx_core_1 = require("./sfdx-core");
class UnmaskOptions extends options_1.OptionsBase {
    constructor() {
        super();
        this.sandboxes = new Map();
        this.userQuery = UnmaskOptions.defaultUserQuery;
    }
    async deserialize(serializedOptions) {
        return new Promise((resolve, reject) => {
            try {
                if (!serializedOptions) {
                    return null;
                }
                const options = JSON.parse(serializedOptions);
                if (options.sandboxes) {
                    this.sandboxes = new Map(options.sandboxes);
                }
                if (options.userQuery) {
                    this.userQuery = options.userQuery;
                }
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    async serialize() {
        return new Promise((resolve, reject) => {
            try {
                resolve(JSON.stringify({
                    userQuery: this.userQuery,
                    sandboxes: Array.from(this.sandboxes.entries())
                }, null, sfdx_core_1.SfdxCore.jsonSpaces));
            }
            catch (err) {
                reject(err);
            }
        });
    }
    async loadDefaults() {
        return new Promise((resolve, reject) => {
            try {
                this.userQuery = UnmaskOptions.defaultUserQuery;
                this.sandboxes.set('SNDBX1', [
                    'test.user@aie.army.com.sndbx1'
                ]);
                this.sandboxes.set('SNDBX2', [
                    'test.user@aie.army.com.sndbx2'
                ]);
                this.sandboxes.set('SNDBX3', [
                    'test.user@aie.army.com.sndbx3'
                ]);
            }
            catch (err) {
                reject(err);
            }
            resolve();
        });
    }
}
exports.UnmaskOptions = UnmaskOptions;
UnmaskOptions.defaultUserQuery = 'SELECT Id, username, IsActive, Email FROM User';
//# sourceMappingURL=unmask-options.js.map