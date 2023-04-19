"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const sfdx_client_1 = require("../../../../lib/sfdx-client");
const utils_1 = require("../../../../lib/utils");
const constants_1 = require("../../../../lib/constants");
class post extends command_base_1.CommandBase {
    constructor() {
        super(...arguments);
        this.metadataInfo = null;
    }
    async runInternal() {
        const objectName = this.flags.metadata;
        this.metadataInfo = sfdx_client_1.SfdxClient.metaDataInfo[objectName];
        const records = this.flags.records;
        const columns = this.flags.columns ? this.flags.columns.split(',') : null;
        this.logger.debug('Executing api:file:post');
        this.logger.debug(`MetdataInfo: ${JSON.stringify(this.metadataInfo)}`);
        if (!this.metadataInfo) {
            this.raiseError(`MetaDataInfo not found for: ${objectName}.`);
            return;
        }
        this.logger.debug(`Records: ${records}`);
        if (!(await utils_1.default.pathExists(records))) {
            this.raiseError(`Path does not exists: ${records}.`);
            return;
        }
        const sfdxClient = new sfdx_client_1.SfdxClient(this.orgAlias);
        const errors = [];
        let counter = 0;
        for await (const recordRaw of utils_1.default.parseCSVFile(records)) {
            if (errors.length > 0 && this.flags.allornothing) {
                break;
            }
            counter++;
            this.logger.debug(`RAW ${objectName} from CSV: ${JSON.stringify(recordRaw)}`);
            const record = this.sanitizeRecord(recordRaw, columns);
            const fileName = record[this.metadataInfo.Filename];
            const filePath = record[this.metadataInfo.DataName] ?? fileName;
            if (!filePath) {
                errors.push(`No file path found for record: ${JSON.stringify(record)}.`);
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
                    result = await sfdxClient.postObjectMultipart(objectName, record, fileName, filePath);
                }
                else {
                    result = await this.postObject(objectName, record, filePath);
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
            this.ux.log(`(${counter}) ${objectName} ${result.isError ? 'FAILED' : result.id} for file: ${fileName}`);
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
        const base64Body = await utils_1.default.readFile(filePath, utils_1.default.ReadFileBase64EncodingOption);
        objectRecord[this.metadataInfo.DataName] = base64Body;
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
    sanitizeRecord(raw, columns = []) {
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
post.description = command_base_1.CommandBase.messages.getMessage('api.file.post.commandDescription');
post.examples = [
    `$ sfdx acu-pack:api:file:post -u myOrgAlias -m ContentVersion -r ContentVersions.csv
    Uploads the ContentVersion records defined in ContentVersions.csv. 
    NOTE: filename = PathOnClient, filePath = ContentVersion then PathOnClient`,
    `$ sfdx acu-pack:api:file:post -u myOrgAlias -m ContentVersion -r ContentVersions.csv -c ContentDocumentId,VersionData,PathOnClient
    Uploads the ContentVersion records defined in ContentVersions.csv using only the columns: ContentDocumentId,VersionData,PathOnClient. 
    NOTE: filename = PathOnClient, filePath = ContentVersion then PathOnClient`,
    `$ sfdx acu-pack:api:file:post -u myOrgAlias -m ContentVersion -r ContentVersions.csv -a
    Uploads the ContentVersion records defined in ContentVersions.csv. The whole process will stop on the first failure.
    NOTE: filename = PathOnClient, filePath = ContentVersion then PathOnClient`,
];
post.flagsConfig = {
    metadata: command_1.flags.string({
        char: 'm',
        description: command_base_1.CommandBase.messages.getMessage('api.file.post.metadataFlagDescription'),
        required: true,
    }),
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
    allornothing: command_1.flags.boolean({
        char: 'a',
        description: command_base_1.CommandBase.messages.getMessage('api.file.post.allOrNothingFlagDescription'),
        required: false,
    }),
};
// Comment this out if your command does not require an org username
post.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
post.requiresProject = false;
//# sourceMappingURL=post.js.map