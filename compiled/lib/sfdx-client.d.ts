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
declare class RestResult {
    id: string;
    code: number;
    body: any;
    isError: boolean;
    contentType: string;
    isBinary: boolean;
    throw(): Error;
    getContent(): any;
    private getError;
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
    getMetadataSchema(metaDataType: string, apiKind?: ApiKind): Promise<RestResult>;
    getById(metaDataType: string, id: string, apiKind?: ApiKind): Promise<RestResult>;
    getByIds(metaDataType: string, ids: string[], apiKind?: ApiKind): AsyncGenerator<RestResult, void, void>;
    getByRecords(metaDataType: string, records: any[], recordIdField?: string, apiKind?: ApiKind): AsyncGenerator<RestResult, void, void>;
    updateByRecord(metaDataType: string, record: any, recordIdField?: string, apiKind?: ApiKind): Promise<RestResult>;
    updateByRecords(metaDataType: string, records: any[], recordIdField?: string, apiKind?: ApiKind): AsyncGenerator<RestResult, void, void>;
    do(action: RestAction, metaDataType: string, records?: any[], recordIdField?: string, apiKind?: ApiKind, validStatusCodes?: number[]): AsyncGenerator<RestResult, void, void>;
    doComposite(action: RestAction, record: any, validStatusCodes?: number[]): Promise<RestResult>;
    getMaxApiVersion(): Promise<string>;
    private doInternal;
    private doInternalByIds;
    private doInternalById;
    private getUri;
    private handleResponse;
}
export {};
