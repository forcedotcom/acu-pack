"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs");
const FormData = require("form-data");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const sfdx_client_1 = require("../../../../lib/sfdx-client");
const utils_1 = require("../../../../lib/utils");
const constants_1 = require("../../../../lib/constants");
class post extends command_base_1.CommandBase {
    async runInternal() {
        var e_1, _a;
        var _b;
        const records = this.flags.records;
        this.logger.debug('Executing api:file:post');
        this.logger.debug(`Records: ${records}`);
        if (!(await utils_1.default.pathExists(records))) {
            this.raiseError(`Path does not exists: ${records}.`);
            return;
        }
        const sfdxClient = new sfdx_client_1.SfdxClient(this.orgAlias);
        const errors = [];
        try {
            for (var _c = tslib_1.__asyncValues(utils_1.default.parseCSVFile(records)), _d; _d = await _c.next(), !_d.done;) {
                const contentVersionRaw = _d.value;
                this.logger.debug(`RAW ContentVersion from CSV: ${JSON.stringify(contentVersionRaw)}`);
                const contentVersion = this.sanitizeContentVersion(contentVersionRaw);
                const fileName = contentVersion.PathOnClient;
                const filePath = (_b = contentVersion.VersionData) !== null && _b !== void 0 ? _b : fileName;
                if (!filePath) {
                    errors.push(`No file path found for record: ${JSON.stringify(contentVersion)}.`);
                    continue;
                }
                if (!(await utils_1.default.pathExists(filePath))) {
                    this.raiseError(`Path does not exists: ${filePath}.`);
                    return;
                }
                const uri = await sfdxClient.getUri('ContentVersion');
                const data = fs.createReadStream(filePath);
                const form = new FormData();
                const formContent = JSON.stringify(contentVersion);
                form.append('entity_content', formContent, {
                    contentType: 'application/json',
                });
                form.append('VersionData', data, {
                    filename: fileName,
                    contentType: 'application/octet-stream',
                });
                this.logger.debug(`POSTing: ${fileName}`);
                const result = await utils_1.default.getRestResult(utils_1.RestAction.POST, uri, form, form.getHeaders({ Authorization: `Bearer ${this.connection.accessToken}` }), [200, 201]);
                if (result.isError) {
                    errors.push(`Error uploading: ${filePath} (${result.code}) => ${result.body}}${constants_1.default.EOL}${formContent}`);
                    this.logger.debug(`Error api:file:post failed: ${filePath} (${result.code})=> ${result.body}\r\nForm Data: ${JSON.stringify(form)}`);
                }
                else {
                    this.ux.log(`ContentVersion ${result.body.id} created for file: ${fileName}`);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) await _a.call(_c);
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
    sanitizeContentVersion(raw) {
        const removeProps = ['id', 'filetype'];
        for (const prop of removeProps) {
            if (prop in raw) {
                delete raw[prop];
            }
        }
        return raw;
    }
}
exports.default = post;
post.description = command_base_1.CommandBase.messages.getMessage('api.file.post.commandDescription');
post.examples = [
    `$ sfdx acu-pack:api:file:post -u myOrgAlias -r ContentVersions.csv
    Uploads the ContentVersion records defined in ContentVersions.csv.`,
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