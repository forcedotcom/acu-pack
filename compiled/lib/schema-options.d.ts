export default class SchemaOptions {
    outputDefs: any[];
    excludeFieldIfTrueFilter: string;
    constructor(json?: any);
    getDynamicCode(): string;
}
