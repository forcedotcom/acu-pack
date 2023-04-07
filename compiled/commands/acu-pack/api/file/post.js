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
        const columns = this.flags.columns ? this.flags.columns.split(',') : null;
        this.logger.debug('Executing api:file:post');
        this.logger.debug(`Records: ${records}`);
        if (!(await utils_1.default.pathExists(records))) {
            this.raiseError(`Path does not exists: ${records}.`);
            return;
        }
        const errors = [];
        let counter = 0;
        try {
            for (var _c = tslib_1.__asyncValues(utils_1.default.parseCSVFile(records)), _d; _d = await _c.next(), !_d.done;) {
                const contentVersionRaw = _d.value;
                counter++;
                this.logger.debug(`RAW ContentVersion from CSV: ${JSON.stringify(contentVersionRaw)}`);
                const contentVersion = this.sanitizeContentVersion(contentVersionRaw, columns);
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
                const stats = await utils_1.default.getPathStat(filePath);
                // Do we need to use a multi-part POST?
                let result = null;
                try {
                    if (stats.size > constants_1.default.CONENTVERSION_MAX_SIZE) {
                        result = await this.postObjectMultipart('ContentVersion', contentVersion, fileName, filePath);
                    }
                    else {
                        result = await this.postObject('ContentVersion', contentVersion, filePath);
                    }
                }
                catch (err) {
                    result = new utils_1.RestResult();
                    result.code = 0;
                    result.isError = true;
                    result.body = `Exception: ${err.message}`;
                }
                if (result.isError) {
                    errors.push(`Error uploading: (${counter}) ${filePath} (${result.code}) => ${result.body}}`);
                    this.logger.debug(`Error api:file:post failed: ${filePath} (${result.code})=> ${result.body}`);
                }
                this.ux.log(`(${counter}) ContentVersion ${result.isError ? 'FAILED' : result.id} for file: ${fileName}`);
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
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async postObject(objectName, objectRecord, filePath) {
        this.logger.debug(`POSTing: ${objectName} `);
        this.logger.debug(`POSTing: ${JSON.stringify(objectRecord)}`);
        const result = new utils_1.RestResult();
        const base64Body = await utils_1.default.readFile(filePath, utils_1.default.RedaFileBase64EncodingOption);
        objectRecord.VersionData = base64Body;
        const postResult = await this.connection.sobject(objectName).insert(objectRecord);
        if (postResult.success) {
            result.id = postResult.id;
        }
        else {
            result.code = 400;
            result.body = JSON.stringify(postResult.errors);
        }
        return result;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async postObjectMultipart(objectName, objectRecord, fileName, filePath) {
        this.logger.debug(`multi-part-POSTing: ${objectName} `);
        this.logger.debug(`multi-part-POSTing: ${JSON.stringify(objectRecord)}`);
        const form = new FormData();
        const formContent = JSON.stringify(objectRecord);
        const metaName = post.formDataInfo[objectName].MetaName;
        form.append(metaName, formContent, {
            contentType: constants_1.default.MIME_JSON,
        });
        const dataName = post.formDataInfo[objectName].DataName;
        const data = fs.createReadStream(filePath);
        form.append(dataName, data, {
            filename: fileName,
            contentType: utils_1.default.getMIMEType(fileName), // 'application/octet-stream',
        });
        this.logger.debug(`POSTing: ${fileName}`);
        const sfdxClient = new sfdx_client_1.SfdxClient(this.orgAlias);
        const uri = await sfdxClient.getUri(objectName);
        const result = await utils_1.default.getRestResult(utils_1.RestAction.POST, uri, form, form.getHeaders({ Authorization: `Bearer ${this.connection.accessToken}` }), [200, 201]);
        // Log the form data if an error occurs
        if (result.isError) {
            this.logger.debug(`Error api:file:post failed: ${filePath} (${result.code})=> ${result.body}${constants_1.default.EOL}Form Data: ${JSON.stringify(form)}`);
        }
        else {
            result.id = result.body.id;
        }
        return result;
    }
    sanitizeContentVersion(raw, columns = []) {
        if (columns) {
            const newRaw = {};
            for (const column of columns) {
                if (column in raw) {
                    newRaw[column] = raw[column];
                }
                else {
                    this.raiseError(`The specified column/field ('${column}') does not exist in CSV record: ${JSON.stringify(raw)}`);
                }
            }
            const keys = Object.keys(raw);
            for (const key of keys) {
                if (columns.includes(key)) {
                    continue;
                }
                delete raw[key];
            }
        }
        else {
            for (const key of ['Id', 'FileType']) {
                if (key in raw) {
                    delete raw[key];
                }
            }
        }
        return raw;
    }
}
exports.default = post;
post.formDataInfo = {
    ContentVersion: {
        MetaName: 'entity_content',
        DataName: 'VersionData'
    },
    Document: {
        MetaName: 'entity_document',
        DataName: 'Document'
    },
};
post.description = command_base_1.CommandBase.messages.getMessage('api.file.post.commandDescription');
post.examples = [
    `$ sfdx acu-pack:api:file:post -u myOrgAlias -r ContentVersions.csv
    Uploads the ContentVersion records defined in ContentVersions.csv. 
    NOTE: filename = PathOnClient, filePath = ContentVersion then PathOnClient`,
];
post.flagsConfig = {
    records: command_1.flags.string({
        char: 'r',
        description: command_base_1.CommandBase.messages.getMessage('api.file.post.recordsFlagDescription'),
        required: true,
    }),
    columns: command_1.flags.string({
        char: 'c',
        description: command_base_1.CommandBase.messages.getMessage('api.file.post.columnsFlagDescription'),
        required: false,
    }),
};
// Comment this out if your command does not require an org username
post.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
post.requiresProject = false;
//# sourceMappingURL=post.js.map