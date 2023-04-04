"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const fs = require("fs");
const FormData = require("form-data");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const sfdx_client_1 = require("../../../../lib/sfdx-client");
const utils_1 = require("../../../../lib/utils");
class post extends command_base_1.CommandBase {
    async runInternal() {
        var e_1, _a;
        if (!(await utils_1.default.pathExists(this.flags.records))) {
            this.raiseError(`Path does not exists: ${this.flags.records}.`);
            return;
        }
        this.ux.log(this.flags.folder);
        if (this.flags.folder && !(await utils_1.default.pathExists(this.flags.folder))) {
            this.raiseError(`Path does not exists: ${this.flags.folder}.`);
            return;
        }
        const sfdxClient = new sfdx_client_1.SfdxClient(this.orgAlias);
        const errors = [];
        try {
            for (var _b = tslib_1.__asyncValues(utils_1.default.parseCSVFile(this.flags.records)), _c; _c = await _b.next(), !_c.done;) {
                const contentVersion = _c.value;
                const fileName = contentVersion.PathOnClient;
                const filePath = 'VersionData' in contentVersion
                    ? contentVersion.VersionData
                    : path.join(this.flags.folder, contentVersion.PathOnClient);
                if (!(await utils_1.default.pathExists(filePath))) {
                    this.raiseError(`Path does not exists: ${filePath}.`);
                    return;
                }
                const uri = await sfdxClient.getUri('ContentVersion');
                const data = fs.createReadStream(filePath);
                const form = new FormData();
                form.append('entity_content', JSON.stringify(contentVersion), {
                    contentType: 'application/json',
                });
                form.append('VersionData', data, {
                    filename: fileName,
                    contentType: 'application/octet-stream',
                });
                const result = await utils_1.default.getRestResult(utils_1.RestAction.POST, uri, form, form.getHeaders({ Authorization: `Bearer ${this.connection.accessToken}` }), [200, 201]);
                if (result.isError) {
                    errors.push(`Error uploading: ${filePath} (${result.code})=> ${result.body}\r\nForm Data: ${JSON.stringify(form)}`);
                }
                else {
                    this.ux.log(`ContentVersion ${result.body.id} created for file: ${fileName}`);
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
        if (errors.length > 0) {
            this.ux.log('The following records failed:');
            for (const error of errors) {
                this.ux.log(error);
            }
            this.raiseError('Upload Failed');
        }
    }
}
exports.default = post;
post.description = command_base_1.CommandBase.messages.getMessage('api.file.post.commandDescription');
post.examples = [
    `$ sfdx acu-pack:api:file:post -u myOrgAlias -r ContentVersions.csv -f ./upload-files
    Uploads the ContentVersion records defined in ContentVersions.csv and uses the file located in ./upload-files.`,
];
post.flagsConfig = {
    records: command_1.flags.string({
        char: 'r',
        description: command_base_1.CommandBase.messages.getMessage('api.file.post.recordsFlagDescription'),
        required: true,
    }),
    folder: command_1.flags.string({
        char: 'f',
        description: command_base_1.CommandBase.messages.getMessage('api.file.post.fileFolderFlagDescription'),
    }),
};
// Comment this out if your command does not require an org username
post.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
post.requiresProject = false;
//# sourceMappingURL=post.js.map