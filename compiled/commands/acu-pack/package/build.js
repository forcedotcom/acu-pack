"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../lib/command-base");
const sfdx_core_1 = require("../../../lib/sfdx-core");
const utils_1 = require("../../../lib/utils");
const package_options_1 = require("../../../lib/package-options");
const sfdx_tasks_1 = require("../../../lib/sfdx-tasks");
const options_factory_1 = require("../../../lib/options-factory");
class Build extends command_base_1.CommandBase {
    async runInternal() {
        var e_1, _a;
        var _b;
        // Validate the package path
        const packageFileName = this.flags.package || Build.defaultPackageFileName;
        const packageDir = path.dirname(packageFileName);
        if (packageDir && !(await utils_1.default.pathExists(packageDir))) {
            this.raiseError(`The specified package folder does not exist: '${packageDir}'`);
        }
        let options;
        // Read/Write the options file if it does not exist already
        if (this.flags.options) {
            options = await options_factory_1.OptionsFactory.get(package_options_1.PackageOptions, this.flags.options);
            if (!options) {
                this.raiseError(`Unable to read options file: ${this.flags.options}.`);
            }
        }
        else {
            options = new package_options_1.PackageOptions();
            await options.loadDefaults();
        }
        const excluded = new Set(options.excludeMetadataTypes);
        // Are we including namespaces?
        const namespaces = this.flags.namespaces ? new Set(this.flags.namespaces.split()) : new Set();
        const describeMetadatas = new Set();
        this.ux.log(`Gathering metadata from Org: ${this.orgAlias}(${this.orgId})`);
        let filterMetadataTypes = null;
        if (this.flags.metadata) {
            filterMetadataTypes = new Set();
            for (const metaName of this.flags.metadata.split(',')) {
                filterMetadataTypes.add(metaName.trim());
            }
        }
        const metadataMap = new Map();
        if (this.flags.source) {
            const statuses = await sfdx_tasks_1.SfdxTasks.getSourceTrackingStatus(this.orgAlias);
            if (!statuses || statuses.length === 0) {
                this.ux.log('No Source Tracking changes found.');
                return;
            }
            const results = sfdx_tasks_1.SfdxTasks.getMapFromSourceTrackingStatus(statuses);
            if (results.conflicts.size > 0) {
                this.ux.log('WARNING: The following conflicts were found:');
                for (const [conflictType, members] of results.conflicts) {
                    this.ux.log(`\t${conflictType}`);
                    for (const member of members) {
                        this.ux.log(`\t\t${member}`);
                    }
                }
                this.raiseError('All Conflicts must be resolved.');
            }
            if (results.deletes.size > 0) {
                this.ux.log('WARNING: The following deleted items need to be handled manually:');
                for (const [deleteType, members] of results.deletes) {
                    this.ux.log(`\t${deleteType}`);
                    for (const member of members) {
                        this.ux.log(`\t\t${member}`);
                    }
                }
            }
            if (!((_b = results.map) === null || _b === void 0 ? void 0 : _b.size)) {
                this.ux.log('No Deployable Source Tracking changes found.');
                return;
            }
            for (const [typeName, members] of results.map) {
                if ((filterMetadataTypes && !filterMetadataTypes.has(typeName)) || excluded.has(typeName)) {
                    continue;
                }
                metadataMap.set(typeName, members);
            }
        }
        else {
            const describeMetadata = await sfdx_tasks_1.SfdxTasks.describeMetadata(this.orgAlias);
            for (const metadata of describeMetadata) {
                if ((filterMetadataTypes && !filterMetadataTypes.has(metadata.xmlName)) || excluded.has(metadata.xmlName)) {
                    continue;
                }
                describeMetadatas.add(metadata);
            }
            let counter = 0;
            try {
                for (var _c = tslib_1.__asyncValues(sfdx_tasks_1.SfdxTasks.getTypesForPackage(this.orgAlias, describeMetadatas, namespaces)), _d; _d = await _c.next(), !_d.done;) {
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
                members.sort();
                packageMap.set(typeName, members);
            }
        }
        this.ux.log(`Generating: ${packageFileName}`);
        // Write the final package
        await sfdx_core_1.SfdxCore.writePackageFile(packageMap, packageFileName, this.flags.append);
        return;
    }
}
exports.default = Build;
Build.description = command_base_1.CommandBase.messages.getMessage('package.build.commandDescription');
Build.defaultPackageFileName = 'package.xml';
Build.examples = [
    `$ sfdx acu-pack:package:build -o options/package-options.json -x manifest/package-acu.xml -u myOrgAlias
    Builds a SFDX package file (./manifest/package.xml) which contains all the metadata from the myOrgAlias.
    The options defined (options/package-options.json) are honored when building the package.`,
];
Build.flagsConfig = {
    package: command_1.flags.string({
        char: 'x',
        description: command_base_1.CommandBase.messages.getMessage('package.build.packageFlagDescription', [
            Build.defaultPackageFileName,
        ]),
    }),
    metadata: command_1.flags.string({
        char: 'm',
        description: command_base_1.CommandBase.messages.getMessage('package.build.metadataFlagDescription'),
    }),
    options: command_1.flags.string({
        char: 'o',
        description: command_base_1.CommandBase.messages.getMessage('package.build.optionsFlagDescription'),
    }),
    namespaces: command_1.flags.string({
        char: 'n',
        description: command_base_1.CommandBase.messages.getMessage('namespacesFlagDescription'),
    }),
    source: command_1.flags.boolean({
        char: 's',
        description: command_base_1.CommandBase.messages.getMessage('package.build.sourceFlagDescription'),
    }),
    append: command_1.flags.boolean({
        char: 'a',
        description: command_base_1.CommandBase.messages.getMessage('package.build.appendFlagDescription'),
    }),
};
// Comment this out if your command does not require an org username
Build.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Build.requiresProject = false;
//# sourceMappingURL=build.js.map