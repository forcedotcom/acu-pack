"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sfdx_core_1 = require("./sfdx-core");
class UnmaskOptions {
    constructor() {
        this.sandboxes = new Map();
    }
    static deserialize(serializedOptions) {
        const unmaskOptions = new UnmaskOptions();
        unmaskOptions.sandboxes = new Map(JSON.parse(serializedOptions));
        return unmaskOptions;
    }
    serialize() {
        return JSON.stringify(Array.from(this.sandboxes.entries()), null, sfdx_core_1.SfdxCore.jsonSpaces);
    }
    loadDefaults() {
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
}
exports.UnmaskOptions = UnmaskOptions;
//# sourceMappingURL=unmask-options.js.map