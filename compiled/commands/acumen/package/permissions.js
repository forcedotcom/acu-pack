"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_base_1 = require("../../../lib/command-base");
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
const sfdx_tasks_1 = require("../../../lib/sfdx-tasks");
const sfdx_core_1 = require("../../../lib/sfdx-core");
const path = require("path");
const utils_1 = require("../../../lib/utils");
class Permissions extends command_base_1.CommandBase {
    async run() {
        var e_1, _a;
        const username = this.flags.targetusername;
        const orgId = this.org.getOrgId();
        // Gather metadata names to include
        const metaNames = utils_1.default.sortArray(this.flags.metadata
            ? this.flags.metadata.split()
            : Permissions.defaultMetaTypes);
        this.metaNames = new Set(metaNames);
        // Are we including namespaces?
        this.namespaces = this.flags.namespaces
            ? new Set(this.flags.namespaces.split())
            : new Set();
        this.packageFileName = this.flags.package || Permissions.packageFileName;
        const packageDir = path.dirname(this.packageFileName);
        if (packageDir && !await utils_1.default.pathExistsAsync(packageDir)) {
            throw new core_1.SfdxError(`The specified package folder does not exist: '${packageDir}'`);
        }
        try {
            this.ux.log(`Gathering metadata from Org: ${username}(${orgId})`);
            const describeMetadata = await sfdx_tasks_1.SfdxTasks.describeMetadata(username);
            const describeMetadatas = new Set();
            for (const metadata of describeMetadata) {
                if (this.metaNames.has(metadata.xmlName)) {
                    describeMetadatas.add(metadata);
                    continue;
                }
                if (metadata.childXmlNames) {
                    for (const childName of metadata.childXmlNames) {
                        if (this.metaNames.has(childName)) {
                            // 'adopt' the childName as the xmlName to pull the child metadata
                            metadata.xmlName = childName;
                            describeMetadatas.add(metadata);
                        }
                    }
                }
            }
            this.ux.log(`Generating: ${this.packageFileName}`);
            const metadataMap = new Map();
            let counter = 0;
            try {
                for (var _b = tslib_1.__asyncValues(sfdx_tasks_1.SfdxTasks.getTypesForPackage(username, describeMetadatas, this.namespaces)), _c; _c = await _b.next(), !_c.done;) {
                    const entry = _c.value;
                    metadataMap.set(entry.name, entry.members);
                    this.ux.log(`Processed (${++counter}/${this.metaNames.size}): ${entry.name}`);
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
            await sfdx_core_1.SfdxCore.writePackageFile(metadataMap, this.packageFileName);
            this.ux.log('Done.');
        }
        catch (err) {
            throw err;
        }
        return;
    }
    logAsync(...args) {
        return new Promise((resolve, reject) => {
            this.ux.log(...args);
            resolve();
        });
    }
}
exports.default = Permissions;
Permissions.packageFileName = 'package-permissions.xml';
Permissions.defaultMetaTypes = ['ApexClass', 'ApexPage', 'CustomApplication', 'CustomObject', 'CustomTab', 'PermissionSet', 'Profile'];
Permissions.description = command_base_1.CommandBase.messages.getMessage('package.permissions.commandDescription');
Permissions.examples = [`$ sfdx acumen:package:permissions -u myOrgAlias
    Creates a package file (${Permissions.packageFileName}) which contains
    Profile & PermissionSet metadata related to ${Permissions.defaultMetaTypes.join(', ')} permissions.`,
    `$ sfdx acumen:package:permissions -u myOrgAlias -m CustomObject,CustomApplication
    Creates a package file (${Permissions.packageFileName}) which contains
    Profile & PermissionSet metadata related to CustomObject & CustomApplication permissions.`];
Permissions.flagsConfig = {
    package: command_1.flags.string({
        char: 'x',
        description: command_base_1.CommandBase.messages.getMessage('package.permissions.packageFlagDescription', [Permissions.packageFileName])
    }),
    metadata: command_1.flags.string({
        char: 'm',
        description: command_base_1.CommandBase.messages.getMessage('package.permissions.metadataFlagDescription', [Permissions.defaultMetaTypes.join(', ')])
    }),
    namespaces: command_1.flags.string({
        char: 'n',
        description: command_base_1.CommandBase.messages.getMessage('namespacesFlagDescription')
    })
};
// Comment this out if your command does not require an org username
Permissions.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Permissions.requiresProject = false;
//# sourceMappingURL=permissions.js.map