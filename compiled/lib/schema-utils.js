"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vm = require("vm");
class SchemaUtils {
    static *getDynamicSchemaData(schema, dynamicCode) {
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
    static *getDynamicRecordTypeData(schema, dynamicCode) {
        if (!schema) {
            throw new Error('The schema argument cannot be null.');
        }
        if (!schema.recordTypeInfos) {
            throw new Error('The schema argument does not contains a RecordTypeInfos member.');
        }
        if (!dynamicCode) {
            throw new Error('The dynamicCode argument cannot be null.');
        }
        const context = SchemaUtils.dynamicContext;
        context['schema'] = schema;
        for (const recordTypeInfo of schema.recordTypeInfos) {
            context['recordTypeInfo'] = recordTypeInfo;
            const row = vm.runInNewContext(dynamicCode, context);
            yield row;
        }
    }
    static *getDynamicChildObjectTypeData(schema, dynamicCode) {
        if (!schema) {
            throw new Error('The schema argument cannot be null.');
        }
        if (!schema.childRelationships) {
            throw new Error('The schema argument does not contains a childRelationships member.');
        }
        if (!dynamicCode) {
            throw new Error('The dynamicCode argument cannot be null.');
        }
        const context = SchemaUtils.dynamicContext;
        context['schema'] = schema;
        for (const childRelationship of schema.childRelationships) {
            context['childRelationship'] = childRelationship;
            const row = vm.runInNewContext(dynamicCode, context);
            yield row;
        }
    }
}
exports.default = SchemaUtils;
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