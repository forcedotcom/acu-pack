import * as fs from 'fs';
import * as FormData from 'form-data';
import { SfdxTasks, SfdxOrgInfo } from './sfdx-tasks';
import Utils from './utils';
import { RestAction, RestResult } from './utils';
import  Constants from './/constants'

export const NO_CONTENT_CODE = 204;

export enum ApiKind {
    DEFAULT = '',
    TOOLING = 'tooling',
    COMPOSITE = 'composite'
}

export class SfdxClient {
    public static readonly metaDataInfo = {
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

    private static defailtIdField = 'id';

    private headers = {};
    private orgAliasOrUsername: string;
    private orgInfo: SfdxOrgInfo;
    private apiVersion: string = null;

    public constructor(orgAliasOrUsername: string) {
        if (!orgAliasOrUsername || orgAliasOrUsername.length === 0) {
            throw new Error('orgAliasOrUsername is required');
        }
        this.orgAliasOrUsername = orgAliasOrUsername;
    }

    public async initialize(forceRefresh = false): Promise<void> {
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

    public async* getMetadataSchemas(apiKind: ApiKind = ApiKind.DEFAULT): AsyncGenerator<any, void, void> {
        const result = await this.doInternal(RestAction.GET, null, apiKind);
        if (result.isError) {
            result.throw();
        }
        for await (const metaDataType of result.body.sobjects) {
            yield metaDataType;
        }
    }

    public async getMetadataSchema(metaDataType: string, apiKind: ApiKind = ApiKind.DEFAULT): Promise<RestResult> {
        if (!metaDataType) {
            throw new Error('metadataType parameter is required.');
        }
        const result = await this.doInternal(RestAction.GET, metaDataType, null, apiKind);
        if (result.isError) {
            result.throw();
        }
        return result;
    }

    public async getById(metaDataType: string, id: string, apiKind: ApiKind = ApiKind.DEFAULT): Promise<RestResult> {
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
        return result;
    }

    public async* getByIds(metaDataType: string, ids: string[], apiKind: ApiKind = ApiKind.DEFAULT): AsyncGenerator<RestResult, void, void> {
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
            yield result;
        }
    }

    public async* getByRecords(metaDataType: string, records: any[], recordIdField: string = SfdxClient.defailtIdField, apiKind: ApiKind = ApiKind.DEFAULT): AsyncGenerator<RestResult, void, void> {
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
            yield result;
        }
    }

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    public async updateByRecord(metaDataType: string, record: any, recordIdField: string = SfdxClient.defailtIdField, apiKind: ApiKind = ApiKind.DEFAULT): Promise<RestResult> {
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
        return result;
    }

    public async* updateByRecords(metaDataType: string, records: any[], recordIdField: string = SfdxClient.defailtIdField, apiKind: ApiKind = ApiKind.DEFAULT): AsyncGenerator<RestResult, void, void> {
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
            yield result;
        }
    }

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    public async doMultiPart(action: RestAction, record: any, filePath: string, validStatusCodes = [200] ): Promise<RestResult> {
        if (!record) {
            throw new Error('record parameter is required.');
        }
        if (!filePath) {
            throw new Error('filePath parameter is required.');
        }
        
        const id = Utils.getFieldValue(record, SfdxClient.defailtIdField, true);
        // Delete the id field as SFDC API returns BAD_REQUEST if the object has an ID
        if(id) {
            delete record[SfdxClient.defailtIdField];
        }
        
        const uri = await this.getUri('ContentVersion');
        const result = await this.handleResponse(RestAction.POST, uri, record, validStatusCodes);
        result.id = id;
        return result;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public async postObjectMultipart(objectName: string, objectRecord: any, fileName: string, filePath: string): Promise<any> {
        const form = new FormData();
        const formContent = JSON.stringify(objectRecord);

        const metaName = SfdxClient.metaDataInfo[objectName].MetaName;
        form.append(metaName, formContent, {
            contentType: Constants.MIME_JSON,
        });

        const dataName = SfdxClient.metaDataInfo[objectName].DataName;
        const data = fs.createReadStream(filePath);
        form.append(dataName, data, {
        filename: fileName,
        contentType: Utils.getMIMEType(fileName), // 'application/octet-stream',
        });

        const uri = await this.getUri(objectName);
        const result = await Utils.getRestResult(
            RestAction.POST,
            uri,
            form,
            form.getHeaders({ Authorization: `Bearer ${this.orgInfo.accessToken}` }),
            [200,201]
        );

        // Log the form data if an error occurs
        if(!result.isError){
            result.id = result.body.id;
        }
        return result;
    }

    public async* do(action: RestAction, metaDataType: string, records: any[] = null, recordIdField: string = SfdxClient.defailtIdField, apiKind: ApiKind = ApiKind.DEFAULT, validStatusCodes = [200]): AsyncGenerator<RestResult, void, void> {
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

        } else {
            yield await this.doInternal(action, metaDataType, apiKind, null, validStatusCodes);
        }
    }

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    public async doComposite(action: RestAction = RestAction.GET, record: any, validStatusCodes = [200]): Promise<RestResult> {
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

    public async getMaxApiVersion(): Promise<string> {
        await this.initialize(false);
        const result = await this.handleResponse(
            RestAction.GET,
            `${this.orgInfo.instanceUrl}/services/data`);

        return result.body[result.body.length - 1].version as string;
    }

    public async getUri(metaDataType: string = null, id: string = null, apiKind: ApiKind = ApiKind.DEFAULT): Promise<string> {
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

    private async doInternal(action: RestAction = RestAction.GET, metaDataType: string = null, record: any = null, apiKind: ApiKind = ApiKind.DEFAULT, validStatusCodes = null): Promise<RestResult> {
        const uri = await this.getUri(metaDataType, null, apiKind);
        return await this.handleResponse(action, uri, record, validStatusCodes);
    }

    private async* doInternalByIds(action: RestAction = RestAction.GET, metaDataType: string = null, records: any[], recordIdField: string = SfdxClient.defailtIdField, apiKind: ApiKind = ApiKind.DEFAULT, validStatusCodes = null): AsyncGenerator<any, void, void> {
        for (const record of records) {
            yield await this.doInternalById(action, metaDataType, record, recordIdField, apiKind, validStatusCodes);
        }
    }

    private async doInternalById(action: RestAction = RestAction.GET, metaDataType: string = null, record: any, recordIdField: string = SfdxClient.defailtIdField, apiKind: ApiKind = ApiKind.DEFAULT, validStatusCodes = null): Promise<RestResult> {
        let id = null;
        if (apiKind !== ApiKind.COMPOSITE && record) {
            id = Utils.getFieldValue(record, recordIdField, true);
            // Delete the id field as SFDC API returns BAD_REQUEST if the object has an ID
            delete record[recordIdField];
        }
        const uri = await this.getUri(metaDataType, id, apiKind);
        const result = await this.handleResponse(action, uri, record, validStatusCodes);
        result.id = id;
        return result;
    }
    
    private async handleResponse(action: RestAction = RestAction.GET, uri: string, record: any = null, validStatusCodes = null): Promise<RestResult> {
        return await Utils.getRestResult(action, uri, record, this.headers, validStatusCodes);
    }
}
