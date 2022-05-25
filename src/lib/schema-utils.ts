import * as vm from 'vm';

export default class SchemaUtils {
    public static ENTITY_DEFINITION = 'EntityDefinition';
    public static CONTEXT_FIELD = 'ctx';
    public static CONTEXT_FIELD_NAME = SchemaUtils.CONTEXT_FIELD  + '.name';
    public static CONTEXT_SCHEMA = 'schema';
    public static * getDynamicSchemaData(schema: any, dynamicCode: string, collection: any): Generator<any, void, string[]> {
        if (!schema) {
            throw new Error('The schema argument cannot be null.');
        }
        if (!schema.fields) {
            throw new Error('The schema argument does not contains a fields member.');
        }
        if (!dynamicCode) {
            throw new Error('The dynamicCode argument cannot be null.');
        }

        if (!collection) {
            throw new Error('The collection argument cannot be null.');
        }
        const context = SchemaUtils.dynamicContext;
        context[SchemaUtils.CONTEXT_SCHEMA] = schema;
        for (const item of collection) {
            context[SchemaUtils.CONTEXT_FIELD] = item;
            const row = vm.runInNewContext(dynamicCode, context);
            yield row;
        }
    }

    private static dynamicContext = {
        getPicklistValues(fld: any): string[] {
            const values = [];
            for (const picklistValue of fld.picklistValues) {
                // Show inactive values
                values.push(`${picklistValue.active ? '' : '(-)'}${picklistValue.value}`);
            }
            return values;
        },

        getPicklistDefaultValue(fld: any): string {
            for (const picklistValue of fld.picklistValues) {
                if (picklistValue.active && picklistValue.defaultValue) {
                    return picklistValue.value;
                }
            }
        }
    };
}
