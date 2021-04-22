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
        var _b;
        // Validate the package path
        const packageFileName = this.flags.package || Build.defaultPackageFileName;
        const packageDir = path.dirname(packageFileName);
        if (packageDir && !await utils_1.default.pathExists(packageDir)) {
            throw new core_1.SfdxError(`The specified package folder does not exist: '${packageDir}'`);
        }
        let options;
        // Read/Write the options file if it does not exist already
        if (this.flags.options) {
            options = await options_factory_1.OptionsFactory.get(package_options_1.PackageOptions, this.flags.options);
            if (!options) {
                this.ux.log(`Unable to read options file: ${this.flags.options}.`);
                // Set the proper exit code to indicate violation/failure
                process.exitCode = 1;
                return;
            }
        }
        else {
            options = new package_options_1.PackageOptions();
            await options.loadDefaults();
        }
        if (this.flags.source && this.flags.metadata) {
            this.ux.log('Both source (-s) and metadata (-m) flags cannot be specified, please use one or the other.');
        }
        const excluded = new Set(options.excludeMetadataTypes);
        // Are we including namespaces?
        const namespaces = this.flags.namespaces
            ? new Set(this.flags.namespaces.split())
            : new Set();
        const orgAlias = this.flags.targetusername;
        const orgId = this.org.getOrgId();
        try {
            const describeMetadatas = new Set();
            this.ux.log(`Gathering metadata from Org: ${orgAlias}(${orgId})`);
            let metadataMap = new Map();
            if (this.flags.source) {
                const statuses = await sfdx_tasks_1.SfdxTasks.getSourceTrackingStatus(orgAlias);
                if (!statuses || statuses.length === 0) {
                    this.ux.log('No Source Tracking changes found.');
                    return;
                }
                const results = await sfdx_tasks_1.SfdxTasks.getMapFromSourceTrackingStatus(statuses);
                if (results.conflicts.length > 0) {
                    throw new Error(`WARNING: Conflicts detected for the following metadata types: ${results.conflicts.join(', ')}`);
                }
                if (results.deletes.length > 0) {
                    this.ux.log('WARNING: The following deleted items need to be handled manually:');
                    for (const deleteType of results.deletes) {
                        this.ux.log(`\t${deleteType}`);
                    }
                }
                if (!((_b = results.map) === null || _b === void 0 ? void 0 : _b.size)) {
                    this.ux.log('No Deployable Source Tracking changes found.');
                    return;
                }
                metadataMap = results.map;
            }
            else {
                const describeMetadata = await sfdx_tasks_1.SfdxTasks.describeMetadata(orgAlias);
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
                let counter = 0;
                try {
                    for (var _c = tslib_1.__asyncValues(sfdx_tasks_1.SfdxTasks.getTypesForPackage(orgAlias, describeMetadatas, namespaces)), _d; _d = await _c.next(), !_d.done;) {
                        const entry = _d.value;
                        // If specific members were defined previously - just use them
                        metadataMap.set(entry.name, entry.members);
                        this.ux.log(`Processed (${++counter}/${describeMetadatas.size}): ${entry.name}`);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) await _a.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            const packageMap = new Map();
            // Filter excluded types
            for (const [typeName, members] of metadataMap) {
                if (!excluded.has(typeName)) {
                    packageMap.set(typeName, members);
                }
            }
            this.ux.log(`Generating: ${packageFileName}`);
            // Write the final package
            await sfdx_core_1.SfdxCore.writePackageFile(packageMap, packageFileName);
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
    }),
    source: command_1.flags.boolean({
        char: 's',
        description: command_base_1.CommandBase.messages.getMessage('package.build.sourceFlagDescription')
    })
};
// Comment this out if your command does not require an org username
Build.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Build.requiresProject = false;
//# sourceMappingURL=build.js.map