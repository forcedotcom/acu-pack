"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageOptions = void 0;
const sfdx_tasks_1 = require("../lib/sfdx-tasks");
const options_1 = require("./options");
class PackageOptions extends options_1.OptionsBase {
    constructor() {
        super(...arguments);
        this.excludeMetadataTypes = [];
    }
    async loadDefaults() {
        // When the defaults are loaded - we will pull from the Metadata Coverage Report
        // If we are not allowing external connections at runtime (FedRAMP) - just set to empty array
        this.excludeMetadataTypes = this.settings.blockExternalConnections
            ? []
            : await sfdx_tasks_1.SfdxTasks.getUnsupportedMetadataTypes();
        return;
    }
    get currentVersion() {
        return PackageOptions.CURRENT_VERSION;
    }
}
exports.PackageOptions = PackageOptions;
PackageOptions.CURRENT_VERSION = 1.0;
//# sourceMappingURL=package-options.js.map