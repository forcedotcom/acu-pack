export declare const NO_CONTENT_CODE = 204;
export declare enum RestAction {
    GET = "GET",
    PUT = "PUT",
    POST = "POST",
    DELETE = "DELETE",
    PATCH = "PATCH"
}
export declare enum ApiKind {
    DEFAULT = "",
    TOOLING = "tooling",
    COMPOSITE = "composite"
}
export declare class SfdxClient {
    private static defailtIdField;
    private bent;
    private headers;
    private orgAliasOrUsername;
    private orgInfo;
    private apiVersion;
    constructor(orgAliasOrUsername: string);
    initialize(forceRefresh?: boolean): Promise<void>;
    setApiVersion(apiVersion: number): void;
    getMetadataSchemas(apiKind?: ApiKind): AsyncGenerator<any, void, unknown>;
    getMetadataSchema(metaDataType: string, apiKind?: ApiKind): Promise<any>;
    getById(metaDataType: string, id: string, apiKind?: ApiKind): Promise<any>;
    getByIds(metaDataType: string, ids: string[], apiKind?: ApiKind): AsyncGenerator<any, void, unknown>;
    getByRecords(metaDataType: string, records: any[], recordIdField?: string, apiKind?: ApiKind): AsyncGenerator<any, void, unknown>;
    updateByRecord(metaDataType: string, record: any, recordIdField?: string, apiKind?: ApiKind): Promise<any>;
    updateByRecords(metaDataType: string, records: any[], recordIdField?: string, apiKind?: ApiKind): AsyncGenerator<any, void, unknown>;
    do(action: RestAction, metaDataType: string, records?: any[], recordIdField?: string, apiKind?: ApiKind, validStatusCodes?: number[]): AsyncGenerator<any, void, unknown>;
    doComposite(action: RestAction, record: any, validStatusCodes?: number[]): Promise<any>;
    private doInternal;
    private doInternalById;
    private doInternalByIds;
    private getApiMethod;
    private getUri;
    private handleResponse;
}
