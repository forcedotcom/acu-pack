"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sfdx_tasks_1 = require("./sfdx-tasks");
const utils_1 = require("./utils");
exports.NO_CONTENT_CODE = 204;
var RestAction;
(function (RestAction) {
    RestAction["GET"] = "GET";
    RestAction["PUT"] = "PUT";
    RestAction["POST"] = "POST";
    RestAction["DELETE"] = "DELETE";
    RestAction["PATCH"] = "PATCH";
})(RestAction = exports.RestAction || (exports.RestAction = {}));
;
var ApiKind;
(function (ApiKind) {
    ApiKind["DEFAULT"] = "";
    ApiKind["TOOLING"] = "tooling";
    ApiKind["COMPOSITE"] = "composite";
})(ApiKind = exports.ApiKind || (exports.ApiKind = {}));
;
class RestResult {
    constructor() {
        this.isError = false;
    }
    throw() {
        throw this.getError();
    }
    getResult() {
        return this.getError() || this.body || this.id;
    }
    getError() {
        return this.isError
            ? new Error(`(${this.code}) ${this.body}`)
            : null;
    }
}
class SfdxClient {
    constructor(orgAliasOrUsername) {
        this.bent = require('bent');
        this.headers = {};
        this.apiVersion = '50.0';
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
            const result = yield tslib_1.__await(this.doInternal(RestAction.GET, null, apiKind));
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
        const result = await this.doInternal(RestAction.GET, metaDataType, null, apiKind);
        if (result.isError) {
            result.throw();
        }
        return result.getResult();
    }
    async getById(metaDataType, id, apiKind = ApiKind.DEFAULT) {
        if (!metaDataType) {
            throw new Error('metadataType parameter is required.');
        }
        if (!id) {
            throw new Error('id parameter is required.');
        }
        const result = await this.doInternalById(RestAction.GET, metaDataType, id, null, apiKind);
        if (result.isError) {
            result.throw();
        }
        return result.getResult();
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
                for (var _b = tslib_1.__asyncValues(this.doInternalByIds(RestAction.GET, metaDataType, ids, null, apiKind)), _c; _c = yield tslib_1.__await(_b.next()), !_c.done;) {
                    const result = _c.value;
                    if (result.isError) {
                        result.throw();
                    }
                    yield yield tslib_1.__await(result.getResult());
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
                for (var _b = tslib_1.__asyncValues(this.doInternalByIds(RestAction.GET, metaDataType, records, recordIdField, apiKind)), _c; _c = yield tslib_1.__await(_b.next()), !_c.done;) {
                    const result = _c.value;
                    if (result.isError) {
                        result.throw();
                    }
                    yield yield tslib_1.__await(result.getResult());
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
    async updateByRecord(metaDataType, record, recordIdField = SfdxClient.defailtIdField, apiKind = ApiKind.DEFAULT) {
        if (!metaDataType) {
            throw new Error('metadataType parameter is required.');
        }
        if (!record) {
            throw new Error('record parameter is required.');
        }
        const result = await this.doInternalById(RestAction.PATCH, metaDataType, record, recordIdField, apiKind, [exports.NO_CONTENT_CODE]);
        if (result.isError) {
            result.throw();
        }
        return result.getResult();
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
                for (var _b = tslib_1.__asyncValues(this.doInternalByIds(RestAction.PATCH, metaDataType, records, recordIdField, apiKind, [exports.NO_CONTENT_CODE])), _c; _c = yield tslib_1.__await(_b.next()), !_c.done;) {
                    const result = _c.value;
                    if (result.isError) {
                        result.throw();
                    }
                    yield yield tslib_1.__await(result.getResult());
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
                        yield yield tslib_1.__await(result.getResult());
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
    async doComposite(action = RestAction.GET, record, validStatusCodes = [200]) {
        // https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_composite_sobjects_collections.htm
        if (!record) {
            throw new Error('record parameter is required.');
        }
        const result = await this.doInternal(action, null, record, ApiKind.COMPOSITE, validStatusCodes);
        if (result.isError) {
            result.throw();
        }
        return result.getResult();
    }
    async doInternal(action = RestAction.GET, metaDataType = null, record = null, apiKind = ApiKind.DEFAULT, validStatusCodes = null) {
        await this.initialize(false);
        const api = this.getApiMethod(action, metaDataType, apiKind, validStatusCodes || [200]);
        return await this.handleResponse(apiKind, api, null, record);
    }
    async doInternalById(action = RestAction.GET, metaDataType = null, record, recordIdField = SfdxClient.defailtIdField, apiKind = ApiKind.DEFAULT, validStatusCodes = [200]) {
        await this.initialize(false);
        const api = this.getApiMethod(action, metaDataType, apiKind, validStatusCodes);
        return await this.handleResponse(apiKind, api, recordIdField, record);
    }
    doInternalByIds(action = RestAction.GET, metaDataType = null, records, recordIdField = SfdxClient.defailtIdField, apiKind = ApiKind.DEFAULT, validStatusCodes = [200]) {
        return tslib_1.__asyncGenerator(this, arguments, function* doInternalByIds_1() {
            yield tslib_1.__await(this.initialize(false));
            const api = this.getApiMethod(action, metaDataType, apiKind, validStatusCodes);
            for (const record of records) {
                yield yield tslib_1.__await(yield tslib_1.__await(this.handleResponse(apiKind, api, recordIdField, record)));
            }
        });
    }
    getApiMethod(action = RestAction.GET, metaDataType = null, apiKind = ApiKind.DEFAULT, validStatusCodes = [200]) {
        const uri = this.getUri(apiKind, metaDataType);
        const api = this.bent(uri, action.toString(), this.headers, validStatusCodes);
        return api;
    }
    getUri(apiKind = ApiKind.DEFAULT, metaDataType = null) {
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
            uri += metaDataType + '/';
        }
        return uri;
    }
    async handleResponse(apiKind = ApiKind.DEFAULT, apiPromise, recordIdField = SfdxClient.defailtIdField, record = null) {
        const result = new RestResult();
        try {
            if (apiKind != ApiKind.COMPOSITE && record) {
                result.id = utils_1.default.getFieldValue(record, recordIdField, true);
                // Delete the id field as SFDC API restuen BAD_REQUEST if the object has an ID
                delete record[recordIdField];
            }
            const response = await apiPromise(result.id, record);
            // Do we have content?
            result.code = response.statusCode;
            switch (result.code) {
                case exports.NO_CONTENT_CODE:
                    return result;
                default:
                    // Read payload
                    result.body = await response.json();
                    return result;
            }
        }
        catch (err) {
            result.isError = true;
            result.code = err.statusCode;
            result.body = err.message;
        }
        return result;
    }
}
exports.SfdxClient = SfdxClient;
SfdxClient.defailtIdField = 'id';
//# sourceMappingURL=sfdx-client.js.map