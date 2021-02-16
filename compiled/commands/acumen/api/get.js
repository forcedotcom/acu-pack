"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../lib/command-base");
const sfdx_client_1 = require("../../../lib/sfdx-client");
const utils_1 = require("../../../lib/utils");
const path = require("path");
class Unmask extends command_base_1.CommandBase {
    async run() {
        var e_1, _a;
        const orgAlias = this.flags.targetusername;
        const orgId = this.org.getOrgId();
        let hasErrors = false;
        try {
            this.ux.log(`Connecting to Org: ${orgAlias}(${orgId})`);
            const apiKind = this.flags.tooling ? sfdx_client_1.ApiKind.TOOLING : sfdx_client_1.ApiKind.DEFAULT;
            const sfdxClient = new sfdx_client_1.SfdxClient(orgAlias);
            let counter = 0;
            const ids = this.flags.ids.split(',');
            try {
                for (var _b = tslib_1.__asyncValues(sfdxClient.getByIds(this.flags.metadata, ids, apiKind)), _c; _c = await _b.next(), !_c.done;) {
                    const response = _c.value;
                    const outFilePath = this.flags.output
                        ? path.join(this.flags.output, ids[counter++])
                        : ids[counter++];
                    if (response instanceof Buffer) {
                        await utils_1.default.writeFile(outFilePath + '.json', response);
                    }
                    else {
                        await utils_1.default.writeFile(outFilePath + '.json', JSON.stringify(response));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        catch (err) {
            process.exitCode = 1;
            throw err;
        }
        finally {
            if (hasErrors) {
                process.exitCode = 1;
            }
            this.ux.log('Done.');
        }
    }
}
exports.default = Unmask;
Unmask.description = command_base_1.CommandBase.messages.getMessage('api.get.commandDescription');
Unmask.examples = [
    `$ sfdx acumen:api:get -u myOrgAlias -m ContentVersion -i 068r0000003slVtAAI
    Performs the GET REST API action against the ContentVersion metadata type with an id of 068r0000003slVtAAI and writes the body to 068r0000003slVtAAI.json.`,
    `$ sfdx acumen:api:get -u myOrgAlias -m ContentVersion.VersionData -i 068r0000003slVtAAI
    Performs the GET REST API action against the ContentVersion metadata type with an id of 068r0000003slVtAAI and writes the VersionData field value body to 068r0000003slVtAAI.json.`,
    `$ sfdx acumen:api:get -u myOrgAlias -t true -m ContentVersion -i 068r0000003slVtAAI -o ./output/files
    Performs the GET REST API action against the ContentVersion metadata type with an id of 068r0000003slVtAAI and writes the body to ./output/files/068r0000003slVtAAI.json.`,
];
Unmask.flagsConfig = {
    metadata: command_1.flags.string({
        char: 'm',
        description: command_base_1.CommandBase.messages.getMessage('api.get.metadataFlagDescription'),
        required: true
    }),
    ids: command_1.flags.string({
        char: 'i',
        description: command_base_1.CommandBase.messages.getMessage('api.get.idsFlagDescription'),
        required: true
    }),
    output: command_1.flags.string({
        char: 'o',
        description: command_base_1.CommandBase.messages.getMessage('api.get.outputFoldersFlagDescription')
    }),
    tooling: command_1.flags.boolean({
        char: 't',
        description: command_base_1.CommandBase.messages.getMessage('api.get.toolingAPIFlagDescription')
    }),
};
// Comment this out if your command does not require an org username
Unmask.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Unmask.requiresProject = false;
//# sourceMappingURL=get.js.map