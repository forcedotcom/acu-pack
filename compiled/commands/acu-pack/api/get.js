"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../lib/command-base");
const sfdx_client_1 = require("../../../lib/sfdx-client");
const utils_1 = require("../../../lib/utils");
class Unmask extends command_base_1.CommandBase {
    async runInternal() {
        const apiKind = this.flags.tooling ? sfdx_client_1.ApiKind.TOOLING : sfdx_client_1.ApiKind.DEFAULT;
        const sfdxClient = new sfdx_client_1.SfdxClient(this.orgAlias);
        const ids = this.flags.ids.split(',');
        for await (const response of sfdxClient.getByIds(this.flags.metadata, ids, apiKind)) {
            const outFilePath = this.flags.output || '{Id}.json';
            const content = response.getContent();
            if (response.isBinary) {
                await utils_1.default.writeFile(outFilePath.replace('{Id}', response.id), content);
            }
            else {
                await utils_1.default.writeFile(outFilePath.replace('{Id}', response.id), JSON.stringify(content));
            }
        }
    }
}
exports.default = Unmask;
Unmask.description = command_base_1.CommandBase.messages.getMessage('api.get.commandDescription');
Unmask.examples = [
    `$ sfdx acu-pack:api:get -u myOrgAlias -m Account -i 068r0000003slVtAAI
    Performs the GET REST API action against the Account metadata type with an id of 068r0000003slVtAAI and writes the body to 068r0000003slVtAAI.json.`,
    `$ sfdx acu-pack:api:get -u myOrgAlias -t true -m Account -i 068r0000003slVtAAI -o ./output/files/{Id}.json
    Performs the GET REST API action against the Account metadata type with an id of 068r0000003slVtAAI and writes the body to ./output/files/068r0000003slVtAAI.json.`,
    `$ sfdx acu-pack:api:get -u myOrgAlias -m ContentVersion.VersionData -i 068r0000003slVtAAI -o ./output/files/{Id}.pdf
    Performs the GET REST API action against the ContentVersion metadata type with an id of 068r0000003slVtAAI and writes the VersionData field value body to 068r0000003slVtAAI.pdf.
    NOTE: Not all metadata types support field data access.`,
];
Unmask.flagsConfig = {
    metadata: command_1.flags.string({
        char: 'm',
        description: command_base_1.CommandBase.messages.getMessage('api.get.metadataFlagDescription'),
        required: true,
    }),
    ids: command_1.flags.string({
        char: 'i',
        description: command_base_1.CommandBase.messages.getMessage('api.get.idsFlagDescription'),
        required: true,
    }),
    output: command_1.flags.string({
        char: 'o',
        description: command_base_1.CommandBase.messages.getMessage('api.get.outputFoldersFlagDescription'),
    }),
    tooling: command_1.flags.boolean({
        char: 't',
        description: command_base_1.CommandBase.messages.getMessage('api.get.toolingAPIFlagDescription'),
    }),
};
// Comment this out if your command does not require an org username
Unmask.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Unmask.requiresProject = false;
//# sourceMappingURL=get.js.map