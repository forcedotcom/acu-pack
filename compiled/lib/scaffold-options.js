"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScaffoldOptions = void 0;
const options_1 = require("./options");
class ScaffoldOptions extends options_1.OptionsBase {
    constructor() {
        super(...arguments);
        this.sObjectTypes = [];
        this.includeOptionalFields = false;
        this.includeRandomValues = true;
    }
    loadDefaults() {
        return new Promise((resolve, reject) => {
            try {
                this.sObjectTypes = [];
                this.includeOptionalFields = false;
                this.includeRandomValues = false;
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    }
}
exports.ScaffoldOptions = ScaffoldOptions;
//# sourceMappingURL=scaffold-options.js.map