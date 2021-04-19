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
        var e_1, _a, e_2, _b;
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
            const describeMetadata = await sfdx_tasks_1.SfdxTasks.describeMetadata(orgAlias);
            const forceMetadataTypes = new Map();
            if (this.flags.source) {
                let hasConflicts = false;
                const statuses = await sfdx_tasks_1.SfdxTasks.getSourceTrackingStatus(orgAlias);
                try {
                    for (var statuses_1 = tslib_1.__asyncValues(statuses), statuses_1_1; statuses_1_1 = await statuses_1.next(), !statuses_1_1.done;) {
                        const status = statuses_1_1.value;
                        /*
                          Actions: Add, Changed, Deleted
                          {
                            "state": "Local Add",
                            "fullName": "SF86_Template",
                            "type": "StaticResource",
                            "filePath": "force-app\\main\\default\\staticresources\\SF86_Template.xml"
                          },
                          {
                            "state": "Remote Add",
                            "fullName": "Admin",
                            "type": "Profile",
                            "filePath": null
                          },
                           {
                            "state": "Remote Changed (Conflict)",
                            "fullName": "Custom%3A Support Profile",
                            "type": "Profile",
                            "filePath": "force-app\\main\\default\\profiles\\Custom%3A Support Profile.profile-meta.xml"
                          },
                        */
                        const actionParts = status.state.split(' ');
                        if (actionParts[0] === 'Remote') {
                            switch (actionParts[1]) {
                                case 'Add':
                                case 'Changed':
                                    const typeName = status.type.trim();
                                    const fullName = status.fullName.trim();
                                    if (!forceMetadataTypes.has(typeName)) {
                                        forceMetadataTypes.set(typeName, [fullName]);
                                    }
                                    else {
                                        forceMetadataTypes.get(typeName).push(fullName);
                                    }
                                    break;
                                case 'Deleted':
                                    // Not handling deleted yet - but we should create a destructive package
                                    break;
                                default:
                                    throw new Error(`Unknown Action: ${actionParts[1]}`);
                            }
                            if (actionParts.length > 2 && actionParts[2] === '(Conflict)') {
                                hasConflicts = true;
                            }
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (statuses_1_1 && !statuses_1_1.done && (_a = statuses_1.return)) await _a.call(statuses_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                if (hasConflicts) {
                    this.ux.log('WARNING: Conflicts detected - please review package carefully.');
                }
            }
            for (const metadata of describeMetadata) {
                if (!forceMetadataTypes.has(metadata.xmlName) || excluded.has(metadata.xmlName)) {
                    continue;
                }
                describeMetadatas.add(metadata);
            }
            this.ux.log(`Generating: ${packageFileName}`);
            const metadataMap = new Map();
            let counter = 0;
            try {
                for (var _c = tslib_1.__asyncValues(sfdx_tasks_1.SfdxTasks.getTypesForPackage(orgAlias, describeMetadatas, namespaces)), _d; _d = await _c.next(), !_d.done;) {
                    const entry = _d.value;
                    const members = forceMetadataTypes.get(entry.name);
                    // If specific members were defined previously - just use them
                    metadataMap.set(entry.name, (members !== null && members !== void 0 ? members : entry.members));
                    this.ux.log(`Processed (${++counter}/${describeMetadatas.size}): ${entry.name}`);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c.return)) await _b.call(_c);
                }
                finally { if (e_2) throw e_2.error; }
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