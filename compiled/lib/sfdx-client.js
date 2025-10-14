"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SfdxClient = exports.ApiKind = exports.NO_CONTENT_CODE = void 0;
const fs = require("fs");
const FormData = require("form-data");
const sfdx_tasks_1 = require("./sfdx-tasks");
const utils_1 = require("./utils");
const utils_2 = require("./utils");
const constants_1 = require(".//constants");
exports.NO_CONTENT_CODE = 204;
var ApiKind;
(function (ApiKind) {
    ApiKind["DEFAULT"] = "";
    ApiKind["TOOLING"] = "tooling";
    ApiKind["COMPOSITE"] = "composite";
})(ApiKind || (exports.ApiKind = ApiKind = {}));
class SfdxClient {
    constructor(orgAliasOrUsername) {
        this.headers = {};
        this.apiVersion = null;
        if (!orgAliasOrUsername || orgAliasOrUsername.length === 0) {
            throw new Error('orgAliasOrUsername is required');
        }
        this.orgAliasOrUsername = orgAliasOrUsername;
    }
    async initialize(forceRefresh = false) {
        if (!forceRefresh && this.orgInfo) {
            return;
        }
        this.orgInfo = await sfdx_tasks_1.SfdxTasks.getOrgInfo(this.orgAliasOrUsername);
        this.headers = {
            Authorization: `Bearer ${this.orgInfo.accessToken}`,
            Host: this.orgInfo.instanceUrl.split('//')[1]
        };
    }
    setApiVersion(apiVersion) {
        this.apiVersion = apiVersion.toString();
    }
    async *getMetadataSchemas(apiKind = ApiKind.DEFAULT) {
        const result = await this.doInternal(utils_2.RestAction.GET, null, apiKind);
        if (result.isError) {
            result.throw();
        }
        for await (const metaDataType of result.body.sobjects) {
            yield metaDataType;
        }
    }
    async getMetadataSchema(metaDataType, apiKind = ApiKind.DEFAULT) {
        if (!metaDataType) {
            throw new Error('metadataType parameter is required.');
        }
        const result = await this.doInternal(utils_2.RestAction.GET, metaDataType, null, apiKind);
        if (result.isError) {
            result.throw();
        }
        return result;
    }
    async getById(metaDataType, id, apiKind = ApiKind.DEFAULT) {
        if (!metaDataType) {
            throw new Error('metadataType parameter is required.');
        }
        if (!id) {
            throw new Error('id parameter is required.');
        }
        const result = await this.doInternalById(utils_2.RestAction.GET, metaDataType, id, null, apiKind);
        if (result.isError) {
            result.throw();
        }
        return result;
    }
    async *getByIds(metaDataType, ids, apiKind = ApiKind.DEFAULT) {
        if (!metaDataType) {
            throw new Error('metadataType parameter is required.');
        }
        if (!ids) {
            throw new Error('id parameter is required.');
        }
        for await (const result of this.doInternalByIds(utils_2.RestAction.GET, metaDataType, ids, null, apiKind)) {
            if (result.isError) {
                result.throw();
            }
            yield result;
        }
    }
    async *getByRecords(metaDataType, records, recordIdField = SfdxClient.defailtIdField, apiKind = ApiKind.DEFAULT) {
        if (!metaDataType) {
            throw new Error('metadataType parameter is required.');
        }
        if (!records) {
            throw new Error('records parameter is required.');
        }
        for await (const result of this.doInternalByIds(utils_2.RestAction.GET, metaDataType, records, recordIdField, apiKind)) {
            if (result.isError) {
                result.throw();
            }
            yield result;
        }
    }
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    async updateByRecord(metaDataType, record, recordIdField = SfdxClient.defailtIdField, apiKind = ApiKind.DEFAULT) {
        if (!metaDataType) {
            throw new Error('metadataType parameter is required.');
        }
        if (!record) {
            throw new Error('record parameter is required.');
        }
        const result = await this.doInternalById(utils_2.RestAction.PATCH, metaDataType, record, recordIdField, apiKind, [exports.NO_CONTENT_CODE]);
        if (result.isError) {
            result.throw();
        }
        return result;
    }
    async *updateByRecords(metaDataType, records, recordIdField = SfdxClient.defailtIdField, apiKind = ApiKind.DEFAULT) {
        if (!metaDataType) {
            throw new Error('metadataType parameter is required.');
        }
        if (!records) {
            throw new Error('records parameter is required.');
        }
        // Salesforce uses PATCH for updates
        for await (const result of this.doInternalByIds(utils_2.RestAction.PATCH, metaDataType, records, recordIdField, apiKind, [exports.NO_CONTENT_CODE])) {
            if (result.isError) {
                result.throw();
            }
            yield result;
        }
    }
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    async doMultiPart(action, record, filePath, validStatusCodes = [200]) {
        if (!record) {
            throw new Error('record parameter is required.');
        }
        if (!filePath) {
            throw new Error('filePath parameter is required.');
        }
        const id = utils_1.default.getFieldValue(record, SfdxClient.defailtIdField, true);
        // Delete the id field as SFDC API returns BAD_REQUEST if the object has an ID
        if (id) {
            delete record[SfdxClient.defailtIdField];
        }
        const uri = await this.getUri('ContentVersion');
        const result = await this.handleResponse(utils_2.RestAction.POST, uri, record, validStatusCodes);
        result.id = id;
        return result;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async postObjectMultipart(objectName, objectRecord, fileName, filePath) {
        const form = new FormData();
        const formContent = JSON.stringify(objectRecord);
        const metaName = SfdxClient.metaDataInfo[objectName].MetaName;
        form.append(metaName, formContent, {
            contentType: constants_1.default.MIME_JSON,
        });
        const dataName = SfdxClient.metaDataInfo[objectName].DataName;
        const data = fs.createReadStream(filePath);
        form.append(dataName, data, {
            filename: fileName,
            contentType: utils_1.default.getMIMEType(fileName), // 'application/octet-stream',
        });
        const uri = await this.getUri(objectName);
        const result = await utils_1.default.getRestResult(utils_2.RestAction.POST, uri, form, form.getHeaders({ Authorization: `Bearer ${this.orgInfo.accessToken}` }), [200, 201]);
        // Log the form data if an error occurs
        if (!result.isError) {
            result.id = result.body.id;
        }
        return result;
    }
    async *do(action, metaDataType, records = null, recordIdField = SfdxClient.defailtIdField, apiKind = ApiKind.DEFAULT, validStatusCodes = [200]) {
        if (!metaDataType) {
            throw new Error('metadataType parameter is required.');
        }
        if (records) {
            for await (const result of this.doInternalByIds(action, metaDataType, records, recordIdField, apiKind, validStatusCodes)) {
                if (result.isError) {
                    result.throw();
                }
                yield result;
            }
        }
        else {
            yield await this.doInternal(action, metaDataType, apiKind, null, validStatusCodes);
        }
    }
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    async doComposite(action = utils_2.RestAction.GET, record, validStatusCodes = [200]) {
        // https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_composite_sobjects_collections.htm
        if (!record) {
            throw new Error('record parameter is required.');
        }
        const result = await this.doInternal(action, null, record, ApiKind.COMPOSITE, validStatusCodes);
        if (result.isError) {
            result.throw();
        }
        return result;
    }
    async getMaxApiVersion() {
        await this.initialize(false);
        const result = await this.handleResponse(utils_2.RestAction.GET, `${this.orgInfo.instanceUrl}/services/data`);
        return result.body[result.body.length - 1].version;
    }
    async getUri(metaDataType = null, id = null, apiKind = ApiKind.DEFAULT) {
        await this.initialize(false);
        if (!this.apiVersion) {
            this.apiVersion = await this.getMaxApiVersion();
        }
        let uri = `${this.orgInfo.instanceUrl}/services/data/v${this.apiVersion}/`;
        switch (apiKind) {
            case ApiKind.TOOLING:
                uri += 'tooling/';
                break;
            case ApiKind.COMPOSITE:
                uri += 'composite/';
                break;
            default:
                break;
        }
        uri += 'sobjects/';
        if (metaDataType) {
            const parts = metaDataType.split('.');
            uri += parts[0] + '/';
            if (id) {
                uri += id + '/';
            }
            if (parts.length > 1) {
                uri += parts[1] + '/';
            }
        }
        return uri;
    }
    async doInternal(action = utils_2.RestAction.GET, metaDataType = null, record = null, apiKind = ApiKind.DEFAULT, validStatusCodes = null) {
        const uri = await this.getUri(metaDataType, null, apiKind);
        return await this.handleResponse(action, uri, record, validStatusCodes);
    }
    async *doInternalByIds(action = utils_2.RestAction.GET, metaDataType = null, records, recordIdField = SfdxClient.defailtIdField, apiKind = ApiKind.DEFAULT, validStatusCodes = null) {
        for (const record of records) {
            yield await this.doInternalById(action, metaDataType, record, recordIdField, apiKind, validStatusCodes);
        }
    }
    async doInternalById(action = utils_2.RestAction.GET, metaDataType = null, record, recordIdField = SfdxClient.defailtIdField, apiKind = ApiKind.DEFAULT, validStatusCodes = null) {
        let id = null;
        if (apiKind !== ApiKind.COMPOSITE && record) {
            id = utils_1.default.getFieldValue(record, recordIdField, true);
            // Delete the id field as SFDC API returns BAD_REQUEST if the object has an ID
            delete record[recordIdField];
        }
        const uri = await this.getUri(metaDataType, id, apiKind);
        const result = await this.handleResponse(action, uri, record, validStatusCodes);
        result.id = id;
        return result;
    }
    async handleResponse(action = utils_2.RestAction.GET, uri, record = null, validStatusCodes = null) {
        return await utils_1.default.getRestResult(action, uri, record, this.headers, validStatusCodes);
    }
}
exports.SfdxClient = SfdxClient;
SfdxClient.metaDataInfo = {
    ContentVersion: {
        MetaName: 'entity_content',
        DataName: 'VersionData',
        Filename: 'PathOnClient'
    },
    Document: {
        MetaName: 'entity_document',
        DataName: 'Body',
        Filename: 'Name'
    },
    Attachment: {
        MetaName: 'entity_document',
        DataName: 'Body',
        Filename: 'Name'
    },
};
SfdxClient.defailtIdField = 'id';
//# sourceMappingURL=sfdx-client.js.map