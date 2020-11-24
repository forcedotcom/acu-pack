import { SfdxTasks, SfdxOrgInfo } from './sfdx-tasks';
import Utils from './utils';

export const NO_CONTENT_CODE = 204;

export enum RestAction {
    GET = 'GET',
    PUT = 'PUT',
    POST = 'POST',
    DELETE = 'DELETE',
    PATCH = 'PATCH'
}

export enum ApiKind {
    DEFAULT = '',
    TOOLING = 'tooling',
    COMPOSITE = 'composite'
}

class RestResult {
    public id: string;
    public code: number;
    public body: any;
    public isError = false;

    public throw(): Error {
        throw this.getError();
    }

    public getResult(): any {
        return this.getError() || this.body || this.id;
    }

    private getError(): Error {
        return this.isError
            ? new Error(`(${this.code}) ${this.body}`)
            : null;
    }
}

export class SfdxClient {
    private static defailtIdField = 'id';

    private bent = require('bent');
    private headers = {};
    private orgAliasOrUsername: string;
    private orgInfo: SfdxOrgInfo;
    private apiVersion: string = '50.0';

    constructor(orgAliasOrUsername: string) {
        if (!orgAliasOrUsername || orgAliasOrUsername.length === 0) {
            throw new Error('orgAliasOrUsername is required');
        }
        this.orgAliasOrUsername = orgAliasOrUsername;
    }

    public async initialize(forceRefresh: boolean = false): Promise<void> {
        if (!forceRefresh && this.orgInfo) {
            return;
        }
        this.orgInfo = await SfdxTasks.getOrgInfo(this.orgAliasOrUsername);
        this.headers = {
            Authorization: `Bearer ${this.orgInfo.accessToken}`,
            Host: this.orgInfo.instanceUrl.split('//')[1]
        };
    }

    public setApiVersion(apiVersion: number): void {
        this.apiVersion = apiVersion.toString();
    }

    public async* getMetadataSchemas(apiKind: ApiKind = ApiKind.DEFAULT) {
        const result = await this.doInternal(RestAction.GET, null, apiKind);
        if (result.isError) {
            result.throw();
        }
        for await (const metaDataType of result.body.sobjects) {
            yield metaDataType;
        }
    }

    public async getMetadataSchema(metaDataType: string, apiKind: ApiKind = ApiKind.DEFAULT) {
        if (!metaDataType) {
            throw new Error('metadataType parameter is required.');
        }
        const result = await this.doInternal(RestAction.GET, metaDataType, null, apiKind);
        if (result.isError) {
            result.throw();
        }
        return result.getResult();
    }

    public async getById(metaDataType: string, id: string, apiKind: ApiKind = ApiKind.DEFAULT) {
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

    public async* getByIds(metaDataType: string, ids: string[], apiKind: ApiKind = ApiKind.DEFAULT) {
        if (!metaDataType) {
            throw new Error('metadataType parameter is required.');
        }
        if (!ids) {
            throw new Error('id parameter is required.');
        }
        for await (const result of this.doInternalByIds(RestAction.GET, metaDataType, ids, null, apiKind)) {
            if (result.isError) {
                result.throw();
            }
            yield result.getResult();
        }
    }

    public async* getByRecords(metaDataType: string, records: any[], recordIdField: string = SfdxClient.defailtIdField, apiKind: ApiKind = ApiKind.DEFAULT) {
        if (!metaDataType) {
            throw new Error('metadataType parameter is required.');
        }
        if (!records) {
            throw new Error('records parameter is required.');
        }

        for await (const result of this.doInternalByIds(RestAction.GET, metaDataType, records, recordIdField, apiKind)) {
            if (result.isError) {
                result.throw();
            }
            yield result.getResult();
        }
    }

    public async updateByRecord(metaDataType: string, record: any, recordIdField: string = SfdxClient.defailtIdField, apiKind: ApiKind = ApiKind.DEFAULT) {
        if (!metaDataType) {
            throw new Error('metadataType parameter is required.');
        }
        if (!record) {
            throw new Error('record parameter is required.');
        }
        const result = await this.doInternalById(RestAction.PATCH, metaDataType, record, recordIdField, apiKind, [NO_CONTENT_CODE]);
        if (result.isError) {
            result.throw();
        }
        return result.getResult();
    }

    public async* updateByRecords(metaDataType: string, records: any[], recordIdField: string = SfdxClient.defailtIdField, apiKind: ApiKind = ApiKind.DEFAULT) {
        if (!metaDataType) {
            throw new Error('metadataType parameter is required.');
        }
        if (!records) {
            throw new Error('records parameter is required.');
        }
        // Salesforce uses PATCH for updates
        for await (const result of this.doInternalByIds(RestAction.PATCH, metaDataType, records, recordIdField, apiKind, [NO_CONTENT_CODE])) {
            if (result.isError) {
                result.throw();
            }
            yield result.getResult();
        }
    }

    public async* do(action: RestAction, metaDataType: string, records: any[] = null, recordIdField: string = SfdxClient.defailtIdField, apiKind: ApiKind = ApiKind.DEFAULT, validStatusCodes = [200]) {
        if (!metaDataType) {
            throw new Error('metadataType parameter is required.');
        }
        if (records) {
            for await (const result of this.doInternalByIds(action, metaDataType, records, recordIdField, apiKind, validStatusCodes)) {
                if (result.isError) {
                    result.throw();
                }
                yield result.getResult();
            }

        } else {
            yield await this.doInternal(action, metaDataType, apiKind, null, validStatusCodes);
        }
    }

    public async doComposite(action: RestAction = RestAction.GET, record: any, validStatusCodes = [200]) {
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

    private async doInternal(action: RestAction = RestAction.GET, metaDataType: string = null, record: any = null, apiKind: ApiKind = ApiKind.DEFAULT, validStatusCodes = null): Promise<RestResult> {
        await this.initialize(false);
        const api = this.getApiMethod(action, metaDataType, apiKind, validStatusCodes || [200]);
        return await this.handleResponse(apiKind, api, null, record);
    }

    private async doInternalById(action: RestAction = RestAction.GET, metaDataType: string = null, record: any, recordIdField: string = SfdxClient.defailtIdField, apiKind: ApiKind = ApiKind.DEFAULT, validStatusCodes = [200]): Promise<RestResult> {
        await this.initialize(false);
        const api = this.getApiMethod(action, metaDataType, apiKind, validStatusCodes);
        return await this.handleResponse(apiKind, api, recordIdField, record);
    }

    private async* doInternalByIds(action: RestAction = RestAction.GET, metaDataType: string = null, records: any[], recordIdField: string = SfdxClient.defailtIdField, apiKind: ApiKind = ApiKind.DEFAULT, validStatusCodes = [200]) {
        await this.initialize(false);
        const api = this.getApiMethod(action, metaDataType, apiKind, validStatusCodes);
        for (const record of records) {
            yield await this.handleResponse(apiKind, api, recordIdField, record);
        }
    }

    private getApiMethod(action: RestAction = RestAction.GET, metaDataType: string = null, apiKind: ApiKind = ApiKind.DEFAULT, validStatusCodes = [200]): any {
        const uri = this.getUri(apiKind, metaDataType);
        const api = this.bent(uri, action.toString(), this.headers, validStatusCodes);
        return api;
    }

    private getUri(apiKind: ApiKind = ApiKind.DEFAULT, metaDataType: string = null): string {
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

    private async handleResponse(apiKind: ApiKind = ApiKind.DEFAULT, apiPromise: any, recordIdField: string = SfdxClient.defailtIdField, record: any = null): Promise<RestResult> {
        const result = new RestResult();

        try {
            if (apiKind !== ApiKind.COMPOSITE && record) {
                result.id = Utils.getFieldValue(record, recordIdField, true);
                // Delete the id field as SFDC API restuen BAD_REQUEST if the object has an ID
                delete record[recordIdField];
            }

            const response = await apiPromise(result.id, record);

            // Do we have content?
            result.code = response.statusCode;
            switch (result.code) {
                case NO_CONTENT_CODE:
                    return result;
                default:
                    // Read payload
                    result.body = await response.json();
                    return result;
            }
        } catch (err) {
            result.isError = true;
            result.code = err.statusCode;
            result.body = err.message;
        }
        return result;
    }

}
