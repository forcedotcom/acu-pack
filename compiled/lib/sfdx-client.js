"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SfdxClient = exports.ApiKind = exports.NO_CONTENT_CODE = void 0;
const tslib_1 = require("tslib");
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
})(ApiKind = exports.ApiKind || (exports.ApiKind = {}));
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
    getMetadataSchemas(apiKind = ApiKind.DEFAULT) {
        return tslib_1.__asyncGenerator(this, arguments, function* getMetadataSchemas_1() {
            var e_1, _a;
            const result = yield tslib_1.__await(this.doInternal(utils_2.RestAction.GET, null, apiKind));
            if (result.isError) {
                result.throw();
            }
            try {
                for (var _b = tslib_1.__asyncValues(result.body.sobjects), _c; _c = yield tslib_1.__await(_b.next()), !_c.done;) {
                    const metaDataType = _c.value;
                    yield yield tslib_1.__await(metaDataType);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield tslib_1.__await(_a.call(_b));
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
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
    getByIds(metaDataType, ids, apiKind = ApiKind.DEFAULT) {
        return tslib_1.__asyncGenerator(this, arguments, function* getByIds_1() {
            var e_2, _a;
            if (!metaDataType) {
                throw new Error('metadataType parameter is required.');
            }
            if (!ids) {
                throw new Error('id parameter is required.');
            }
            try {
                for (var _b = tslib_1.__asyncValues(this.doInternalByIds(utils_2.RestAction.GET, metaDataType, ids, null, apiKind)), _c; _c = yield tslib_1.__await(_b.next()), !_c.done;) {
                    const result = _c.value;
                    if (result.isError) {
                        result.throw();
                    }
                    yield yield tslib_1.__await(result);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield tslib_1.__await(_a.call(_b));
                }
                finally { if (e_2) throw e_2.error; }
            }
        });
    }
    getByRecords(metaDataType, records, recordIdField = SfdxClient.defailtIdField, apiKind = ApiKind.DEFAULT) {
        return tslib_1.__asyncGenerator(this, arguments, function* getByRecords_1() {
            var e_3, _a;
            if (!metaDataType) {
                throw new Error('metadataType parameter is required.');
            }
            if (!records) {
                throw new Error('records parameter is required.');
            }
            try {
                for (var _b = tslib_1.__asyncValues(this.doInternalByIds(utils_2.RestAction.GET, metaDataType, records, recordIdField, apiKind)), _c; _c = yield tslib_1.__await(_b.next()), !_c.done;) {
                    const result = _c.value;
                    if (result.isError) {
                        result.throw();
                    }
                    yield yield tslib_1.__await(result);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield tslib_1.__await(_a.call(_b));
                }
                finally { if (e_3) throw e_3.error; }
            }
        });
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
    updateByRecords(metaDataType, records, recordIdField = SfdxClient.defailtIdField, apiKind = ApiKind.DEFAULT) {
        return tslib_1.__asyncGenerator(this, arguments, function* updateByRecords_1() {
            var e_4, _a;
            if (!metaDataType) {
                throw new Error('metadataType parameter is required.');
            }
            if (!records) {
                throw new Error('records parameter is required.');
            }
            try {
                // Salesforce uses PATCH for updates
                for (var _b = tslib_1.__asyncValues(this.doInternalByIds(utils_2.RestAction.PATCH, metaDataType, records, recordIdField, apiKind, [exports.NO_CONTENT_CODE])), _c; _c = yield tslib_1.__await(_b.next()), !_c.done;) {
                    const result = _c.value;
                    if (result.isError) {
                        result.throw();
                    }
                    yield yield tslib_1.__await(result);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield tslib_1.__await(_a.call(_b));
                }
                finally { if (e_4) throw e_4.error; }
            }
        });
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
    do(action, metaDataType, records = null, recordIdField = SfdxClient.defailtIdField, apiKind = ApiKind.DEFAULT, validStatusCodes = [200]) {
        return tslib_1.__asyncGenerator(this, arguments, function* do_1() {
            var e_5, _a;
            if (!metaDataType) {
                throw new Error('metadataType parameter is required.');
            }
            if (records) {
                try {
                    for (var _b = tslib_1.__asyncValues(this.doInternalByIds(action, metaDataType, records, recordIdField, apiKind, validStatusCodes)), _c; _c = yield tslib_1.__await(_b.next()), !_c.done;) {
                        const result = _c.value;
                        if (result.isError) {
                            result.throw();
                        }
                        yield yield tslib_1.__await(result);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield tslib_1.__await(_a.call(_b));
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
            else {
                yield yield tslib_1.__await(yield tslib_1.__await(this.doInternal(action, metaDataType, apiKind, null, validStatusCodes)));
            }
        });
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
    doInternalByIds(action = utils_2.RestAction.GET, metaDataType = null, records, recordIdField = SfdxClient.defailtIdField, apiKind = ApiKind.DEFAULT, validStatusCodes = null) {
        return tslib_1.__asyncGenerator(this, arguments, function* doInternalByIds_1() {
            for (const record of records) {
                yield yield tslib_1.__await(yield tslib_1.__await(this.doInternalById(action, metaDataType, record, recordIdField, apiKind, validStatusCodes)));
            }
        });
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