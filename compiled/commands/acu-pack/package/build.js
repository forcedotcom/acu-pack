"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../lib/command-base");
const sfdx_core_1 = require("../../../lib/sfdx-core");
const utils_1 = require("../../../lib/utils");
const package_options_1 = require("../../../lib/package-options");
const sfdx_tasks_1 = require("../../../lib/sfdx-tasks");
const options_factory_1 = require("../../../lib/options-factory");
const constants_1 = require("../../../lib/constants");
const delta_provider_1 = require("../../../lib/delta-provider");
const delta_command_1 = require("../../../lib/delta-command");
const schema_utils_1 = require("../../../lib/schema-utils");
class Build extends command_base_1.CommandBase {
    static async getMetadataMapFromOrg(orgAlias, ux, options, cmdFlags) {
        const metadataMap = new Map();
        const excluded = new Set(options.excludeMetadataTypes);
        let filterMetadataTypes = null;
        if (cmdFlags.metadata) {
            filterMetadataTypes = new Set();
            for (const metaName of cmdFlags.metadata.split(',')) {
                filterMetadataTypes.add(metaName.trim());
            }
        }
        if (cmdFlags.source) {
            const statuses = await sfdx_tasks_1.SfdxTasks.getSourceTrackingStatus(orgAlias);
            if (!statuses || statuses.length === 0) {
                ux.log('No Source Tracking changes found.');
                return;
            }
            const results = sfdx_tasks_1.SfdxTasks.getMapFromSourceTrackingStatus(statuses);
            if (results.conflicts.size > 0) {
                ux.log('WARNING: The following conflicts were found:');
                for (const [conflictType, members] of results.conflicts) {
                    ux.log(`\t${conflictType}`);
                    for (const member of members) {
                        ux.log(`\t\t${member}`);
                    }
                }
                throw new Error('All Conflicts must be resolved.');
            }
            if (results.deletes.size > 0) {
                ux.log('WARNING: The following deleted items need to be handled manually:');
                for (const [deleteType, members] of results.deletes) {
                    ux.log(`\t${deleteType}`);
                    for (const member of members) {
                        ux.log(`\t\t${member}`);
                    }
                }
            }
            if (!results.map?.size) {
                ux.log('No Deployable Source Tracking changes found.');
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
            const describeMetadata = await sfdx_tasks_1.SfdxTasks.describeMetadata(orgAlias);
            const describeMetadatas = new Set();
            for (const metadata of describeMetadata) {
                if ((filterMetadataTypes && !filterMetadataTypes.has(metadata.xmlName)) || excluded.has(metadata.xmlName)) {
                    continue;
                }
                describeMetadatas.add(metadata);
            }
            let counter = 0;
            // Are we including namespaces?
            const namespaces = cmdFlags.namespaces ? new Set(cmdFlags.namespaces.split()) : new Set();
            for await (const entry of sfdx_tasks_1.SfdxTasks.getTypesForPackage(orgAlias, describeMetadatas, namespaces)) {
                // If specific members were defined previously - just use them
                metadataMap.set(entry.name, entry.members);
                ux.log(`Processed (${++counter}/${describeMetadatas.size}): ${entry.name}`);
            }
        }
        return metadataMap;
    }
    static async getMetadataMapFromFolder(folder, ux, options) {
        const metadataMap = new Map();
        const excluded = new Set(options.excludeMetadataTypes);
        if (!excluded) {
            return;
        }
        if (!(await utils_1.default.pathExists(folder))) {
            throw new Error(`The specified MDAPI folder does not exist: ${folder}`);
        }
        // Get all the folders from the root of the MDAPI folder
        for await (const folderPath of utils_1.default.getFolders(folder, false)) {
            const packageType = options.mdapiMap.get(path.basename(folderPath));
            if (!packageType) {
                continue;
            }
            const members = [];
            for await (const memberFile of Build.getMDAPIFiles(packageType, folderPath, false)) {
                members.push(memberFile.replace(folderPath + path.sep, ''));
            }
            metadataMap.set(packageType, members);
        }
        return metadataMap;
    }
    static async *getMDAPIFiles(xmlName, folder, isDocument = false) {
        for await (const filePath of utils_1.default.getItems(folder, utils_1.IOItem.Both, false)) {
            if (filePath.endsWith(constants_1.default.METADATA_FILE_SUFFIX)) {
                continue;
            }
            const itemName = path.basename(filePath);
            const isDir = await utils_1.default.isDirectory(filePath);
            if (itemName !== 'unfiled$public') {
                if (isDocument) {
                    yield itemName;
                }
                else if (!isDir) {
                    yield schema_utils_1.default.getMetadataBaseName(itemName);
                }
            }
            // if not os.path.isdir(filePath) and xmlName in INST_PKG_REF_METADATA:
            // Common.removeInstPkgReference(filePath, Common.canRemoveAllPackageReferences(xmlName))
            if (isDir) {
                const fullCopyPath = delta_provider_1.DeltaProvider.getFullCopyPath(filePath, delta_command_1.DeltaCommandBase.defaultCopyDirList);
                if (fullCopyPath) {
                    yield itemName;
                }
                else {
                    for await (const subFilePath of Build.getMDAPIFiles(xmlName, filePath, xmlName === 'Document')) {
                        yield path.join(filePath, subFilePath);
                    }
                }
            }
        }
    }
    async runInternal() {
        // Validate the package path
        const packageFileName = this.flags.package || constants_1.default.DEFAULT_PACKAGE_PATH;
        const packageDir = path.dirname(this.flags.folder ? this.flags.folder : packageFileName);
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
        let metadataMap = null;
        try {
            if (this.flags.folder) {
                metadataMap = await Build.getMetadataMapFromFolder(this.flags.folder, this.ux, options);
            }
            else {
                this.ux.log(`Gathering metadata from Org: ${this.orgAlias}(${this.orgId})`);
                metadataMap = await Build.getMetadataMapFromOrg(this.orgAlias, this.ux, options, this.flags);
            }
        }
        catch (err) {
            this.raiseError(err.message);
        }
        const packageMap = new Map();
        const excluded = new Set(options.excludeMetadataTypes);
        // Filter excluded types
        for (const [typeName, members] of metadataMap) {
            if (!excluded.has(typeName)) {
                utils_1.default.sortArray(members);
                packageMap.set(typeName, members);
            }
        }
        this.ux.log(`Generating: ${packageFileName}`);
        // Write the final package
        await sfdx_core_1.SfdxCore.writePackageFile(packageMap, packageFileName, this.flags.append);
        return;
    }
}
Build.description = command_base_1.CommandBase.messages.getMessage('package.build.commandDescription');
Build.examples = [
    `$ sfdx acu-pack:package:build -o options/package-options.json -x manifest/package-acu.xml -u myOrgAlias
    Builds a SFDX package file (./manifest/package.xml) which contains all the metadata from the myOrgAlias.
    The options defined (options/package-options.json) are honored when building the package.`,
    `$ sfdx acu-pack:package:build -f deploy
    Builds a SFDX package file (./manifest/package.xml) from the MDAPI formatted data in the deploy folder .`
];
Build.flagsConfig = {
    package: command_1.flags.string({
        char: 'x',
        description: command_base_1.CommandBase.messages.getMessage('package.build.packageFlagDescription', [
            constants_1.default.DEFAULT_PACKAGE_NAME,
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
        char: 't',
        description: command_base_1.CommandBase.messages.getMessage('package.build.sourceFlagDescription'),
    }),
    folder: command_1.flags.string({
        char: 'f',
        description: command_base_1.CommandBase.messages.getMessage('package.build.mdapiFolderFlagDescription'),
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
exports.default = Build;
//# sourceMappingURL=build.js.map