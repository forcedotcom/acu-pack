"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vm = require("vm");
class SchemaUtils {
    static *getDynamicSchemaData(schema, dynamicCode, collection) {
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
}
exports.default = SchemaUtils;
SchemaUtils.CONTEXT_FIELD = 'ctx';
SchemaUtils.CONTEXT_SCHEMA = 'schema';
SchemaUtils.dynamicContext = {
    getPicklistValues(fld) {
        const values = [];
        for (const picklistValue of fld.picklistValues) {
            // Show inactive values
            values.push(`${picklistValue.active ? '' : '(-)'}${picklistValue.value}`);
        }
        return values;
    },
    getPicklistDefaultValue(fld) {
        for (const picklistValue of fld.picklistValues) {
            if (picklistValue.active && picklistValue.defaultValue) {
                return picklistValue.value;
            }
        }
    }
};
//# sourceMappingURL=schema-utils.js.map