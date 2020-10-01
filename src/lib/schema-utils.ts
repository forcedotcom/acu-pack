import * as vm from 'vm';

export default class SchemaUtils {
    public static * getDynamicSchemaData(schema: any, dynamicCode: string): Generator<any, void, string[]> {
        if (!schema) {
            throw new Error('The schema argument cannot be null.');
        }
        if (!schema.fields) {
            throw new Error('The schema argument does not contains a fields member.');
        }
        if (!dynamicCode) {
            throw new Error('The dynamicCode argument cannot be null.');
        }
        const context = SchemaUtils.dynamicContext;
        context['schema'] = schema;
        for (const field of schema.fields) {
            context['field'] = field;
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
