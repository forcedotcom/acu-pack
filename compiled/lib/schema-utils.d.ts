export default class SchemaUtils {
    static getDynamicSchemaData(schema: any, dynamicCode: string): Generator<any, void, string[]>;
    static getDynamicRecordTypeData(schema: any, dynamicCode: string): Generator<any, void, string[]>;
    static getDynamicChildObjectTypeData(schema: any, dynamicCode: string): Generator<any, void, string[]>;
    private static dynamicContext;
}
