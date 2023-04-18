"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../lib/command-base");
const sfdx_tasks_1 = require("../../../lib/sfdx-tasks");
const sfdx_permission_1 = require("../../../lib/sfdx-permission");
const sfdx_core_1 = require("../../../lib/sfdx-core");
const utils_1 = require("../../../lib/utils");
class Permissions extends command_base_1.CommandBase {
    async runInternal() {
        // Gather metadata names to include
        const metaNames = utils_1.default.sortArray(this.flags.metadata ? this.flags.metadata.split() : sfdx_permission_1.SfdxPermission.defaultPermissionMetaTypes);
        this.metaNames = new Set(metaNames);
        // Are we including namespaces?
        this.namespaces = this.flags.namespaces ? new Set(this.flags.namespaces.split()) : new Set();
        this.packageFileName = this.flags.package || Permissions.packageFileName;
        const packageDir = path.dirname(this.packageFileName);
        if (packageDir && !(await utils_1.default.pathExists(packageDir))) {
            this.raiseError(`The specified package folder does not exist: '${packageDir}'`);
        }
        this.ux.log(`Gathering metadata from Org: ${this.orgAlias}(${this.orgId})`);
        const describeMetadata = await sfdx_tasks_1.SfdxTasks.describeMetadata(this.orgAlias);
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
        for await (const entry of sfdx_tasks_1.SfdxTasks.getTypesForPackage(this.orgAlias, describeMetadatas, this.namespaces)) {
            metadataMap.set(entry.name, entry.members);
            this.ux.log(`Processed (${++counter}/${describeMetadatas.size}): ${entry.name}`);
        }
        // Write the final package
        await sfdx_core_1.SfdxCore.writePackageFile(metadataMap, this.packageFileName);
        return;
    }
}
exports.default = Permissions;
Permissions.packageFileName = 'package-permissions.xml';
Permissions.description = command_base_1.CommandBase.messages.getMessage('package.permissions.commandDescription');
Permissions.examples = [
    `$ sfdx acu-pack:package:permissions -u myOrgAlias
    Creates a package file (${Permissions.packageFileName}) which contains
    Profile & PermissionSet metadata related to ${sfdx_permission_1.SfdxPermission.defaultPermissionMetaTypes.join(', ')} permissions.`,
    `$ sfdx acu-pack:package:permissions -u myOrgAlias -m CustomObject,CustomApplication
    Creates a package file (${Permissions.packageFileName}) which contains
    Profile & PermissionSet metadata related to CustomObject & CustomApplication permissions.`,
];
Permissions.flagsConfig = {
    package: command_1.flags.string({
        char: 'x',
        description: command_base_1.CommandBase.messages.getMessage('package.permissions.packageFlagDescription', [
            Permissions.packageFileName,
        ]),
    }),
    metadata: command_1.flags.string({
        char: 'm',
        description: command_base_1.CommandBase.messages.getMessage('package.permissions.metadataFlagDescription', [
            sfdx_permission_1.SfdxPermission.defaultPermissionMetaTypes.join(', '),
        ]),
    }),
    namespaces: command_1.flags.string({
        char: 'n',
        description: command_base_1.CommandBase.messages.getMessage('namespacesFlagDescription'),
    }),
};
// Comment this out if your command does not require an org username
Permissions.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Permissions.requiresProject = false;
//# sourceMappingURL=permissions.js.map