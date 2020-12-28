"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
const command_base_1 = require("../../../lib/command-base");
const sfdx_core_1 = require("../../../lib/sfdx-core");
const utils_1 = require("../../../lib/utils");
const package_options_1 = require("../../../lib/package-options");
const path = require("path");
const sfdx_tasks_1 = require("../../../lib/sfdx-tasks");
const options_factory_1 = require("../../../lib/options-factory");
class Build extends command_base_1.CommandBase {
    async run() {
        var e_1, _a;
        // Validate the package path
        const packageFileName = this.flags.package || Build.defaultPackageFileName;
        const packageDir = path.dirname(packageFileName);
        if (packageDir && !await utils_1.default.pathExistsAsync(packageDir)) {
            throw new core_1.SfdxError(`The specified package folder does not exist: '${packageDir}'`);
        }
        let options;
        // Read/Write the options file if it does not exist already
        if (this.flags.options) {
            options = await options_factory_1.OptionsFactory.get(package_options_1.PackageOptions, this.flags.options);
        }
        else {
            options = new package_options_1.PackageOptions();
            await options.loadDefaults();
        }
        const excluded = new Set(options.excludeMetadataTypes);
        // Are we including namespaces?
        const namespaces = this.flags.namespaces
            ? new Set(this.flags.namespaces.split())
            : new Set();
        const username = this.flags.targetusername;
        const orgId = this.org.getOrgId();
        try {
            const describeMetadatas = new Set();
            this.ux.log(`Gathering metadata from Org: ${username}(${orgId})`);
            const describeMetadata = await sfdx_tasks_1.SfdxTasks.describeMetadata(username);
            let forceMetadataTypes = null;
            if (this.flags.metadata) {
                forceMetadataTypes = new Set();
                for (const metaName of this.flags.metadata.split(',')) {
                    forceMetadataTypes.add(metaName.trim());
                }
            }
            for (const metadata of describeMetadata) {
                if ((forceMetadataTypes && !forceMetadataTypes.has(metadata.xmlName)) || excluded.has(metadata.xmlName)) {
                    continue;
                }
                describeMetadatas.add(metadata);
            }
            this.ux.log(`Generating: ${packageFileName}`);
            const metadataMap = new Map();
            let counter = 0;
            try {
                for (var _b = tslib_1.__asyncValues(sfdx_tasks_1.SfdxTasks.getTypesForPackage(username, describeMetadatas, namespaces)), _c; _c = await _b.next(), !_c.done;) {
                    const entry = _c.value;
                    metadataMap.set(entry.name, entry.members);
                    this.ux.log(`Processed (${++counter}/${describeMetadatas.size}): ${entry.name}`);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Write the final package
            await sfdx_core_1.SfdxCore.writePackageFile(metadataMap, packageFileName);
            this.ux.log('Done.');
        }
        catch (err) {
            throw err;
        }
        return;
    }
}
exports.default = Build;
Build.description = command_base_1.CommandBase.messages.getMessage('package.build.commandDescription');
Build.defaultPackageFileName = 'package.xml';
Build.examples = [
    `$ sfdx acumen:package:build -o options/package-options.json -x manifest/package-acu.xml -u myOrgAlias
    Builds a SFDX package file (./manifest/package.xml) which contains all the metadata from the myOrgAlias.
    The options defined (options/package-options.json) are honored when building the package.`
];
Build.flagsConfig = {
    package: command_1.flags.string({
        char: 'x',
        description: command_base_1.CommandBase.messages.getMessage('package.build.packageFlagDescription', [Build.defaultPackageFileName])
    }),
    metadata: command_1.flags.string({
        char: 'm',
        description: command_base_1.CommandBase.messages.getMessage('package.build.metadataFlagDescription')
    }),
    options: command_1.flags.string({
        char: 'o',
        description: command_base_1.CommandBase.messages.getMessage('package.build.optionsFlagDescription')
    }),
    namespaces: command_1.flags.string({
        char: 'n',
        description: command_base_1.CommandBase.messages.getMessage('namespacesFlagDescription')
    })
};
// Comment this out if your command does not require an org username
Build.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Build.requiresProject = false;
//# sourceMappingURL=build.js.map