export default class SchemaUtils {
    static ENTITY_DEFINITION: string;
    static CONTEXT_FIELD: string;
    static CONTEXT_FIELD_NAME: string;
    static CONTEXT_SCHEMA: string;
    static getDynamicSchemaData(schema: any, dynamicCode: string, collection: any): Generator<any, void, string[]>;
    private static dynamicContext;
}
