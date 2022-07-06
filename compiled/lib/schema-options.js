"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("./options");
const sfdx_core_1 = require("./sfdx-core");
const schema_utils_1 = require("./schema-utils");
class SchemaOptions extends options_1.OptionsBase {
    constructor() {
        super(...arguments);
        this.excludeCustomObjectNames = [];
        this.includeCustomObjectNames = [];
        this.outputDefMap = new Map();
    }
    getDynamicCode(sheetName = null) {
        let code = 'main(); function main() { const row=[];';
        if (this.excludeFieldIfTrueFilter) {
            code += `if( ${this.excludeFieldIfTrueFilter} ) { return []; } `;
        }
        const outputDefs = sheetName
            ? this.outputDefMap.get(sheetName)
            : this.outputDefMap.get(this.outputDefMap.keys[0]);
        if (outputDefs) {
            for (const outputDef of outputDefs) {
                const parts = outputDef.split('|');
                // skip entitydefinition metadata - need to query for these
                if (parts[1].includes(`${schema_utils_1.default.ENTITY_DEFINITION}.`)) {
                    code += "row.push('');";
                }
                else {
                    code += `row.push(${parts[1]});`;
                }
            }
        }
        code += 'return row; }';
        return code;
    }
    getEntityDefinitionFields(sheetName = null) {
        const fields = [];
        const outputDefs = sheetName
            ? this.outputDefMap.get(sheetName)
            : this.outputDefMap.get(this.outputDefMap.keys[0]);
        const entDefSearch = `${schema_utils_1.default.ENTITY_DEFINITION}.`;
        if (outputDefs) {
            for (const outputDef of outputDefs) {
                const parts = outputDef.split('|');
                if (parts[1].includes(entDefSearch)) {
                    fields.push(parts[1].replace(entDefSearch, ''));
                }
            }
        }
        return fields;
    }
    async deserialize(serializedOptions) {
        return new Promise((resolve, reject) => {
            try {
                if (!serializedOptions) {
                    return null;
                }
                const options = JSON.parse(serializedOptions);
                this.excludeFieldIfTrueFilter = options.excludeFieldIfTrueFilter;
                if (options.excludeCustomObjectNames) {
                    this.excludeCustomObjectNames = options.excludeCustomObjectNames;
                }
                if (options.includeCustomObjectNames) {
                    this.includeCustomObjectNames = options.includeCustomObjectNames;
                }
                if (options.outputDefMap) {
                    this.outputDefMap = new Map(options.outputDefMap);
                }
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    async serialize() {
        return new Promise((resolve, reject) => {
            try {
                resolve(JSON.stringify({
                    excludeCustomObjectNames: this.excludeCustomObjectNames ? this.excludeCustomObjectNames : [],
                    includeCustomObjectNames: this.includeCustomObjectNames ? this.includeCustomObjectNames : [],
                    excludeFieldIfTrueFilter: this.excludeFieldIfTrueFilter ? this.excludeFieldIfTrueFilter : '',
                    outputDefMap: Array.from(this.outputDefMap.entries())
                }, null, sfdx_core_1.SfdxCore.jsonSpaces));
            }
            catch (err) {
                reject(err);
            }
        });
    }
    loadDefaults() {
        return new Promise((resolve, reject) => {
            try {
                this.outputDefMap.set('fields', [
                    `SObjectName|${schema_utils_1.default.CONTEXT_SCHEMA}.name`,
                    `Name|${schema_utils_1.default.CONTEXT_FIELD_NAME}`,
                    `Description|${schema_utils_1.default.ENTITY_DEFINITION}.Description`,
                    `Label|${schema_utils_1.default.CONTEXT_FIELD}.label`,
                    `Datatype|${schema_utils_1.default.CONTEXT_FIELD}.type`,
                    `Length|${schema_utils_1.default.CONTEXT_FIELD}.length`,
                    `Precision|${schema_utils_1.default.CONTEXT_FIELD}.precision`,
                    `Scale|${schema_utils_1.default.CONTEXT_FIELD}.scale`,
                    `Digits|${schema_utils_1.default.CONTEXT_FIELD}.digits`,
                    `IsCustom|${schema_utils_1.default.CONTEXT_FIELD}.custom`,
                    `IsDeprecatedHidden|${schema_utils_1.default.CONTEXT_FIELD}.deprecatedAndHidden`,
                    `IsAutonumber|${schema_utils_1.default.CONTEXT_FIELD}.autoNumber`,
                    `DefaultValue|${schema_utils_1.default.CONTEXT_FIELD}.defaultValue`,
                    `IsFormula|${schema_utils_1.default.CONTEXT_FIELD}.calculated`,
                    `Formula|${schema_utils_1.default.CONTEXT_FIELD}.calculatedFormula`,
                    `IsRequired|!${schema_utils_1.default.CONTEXT_FIELD}.nillable`,
                    `IsExternalId|${schema_utils_1.default.CONTEXT_FIELD}.externalId`,
                    `IsUnique|${schema_utils_1.default.CONTEXT_FIELD}.unique`,
                    `IsCaseSensitive|${schema_utils_1.default.CONTEXT_FIELD}.caseSensitive`,
                    `IsPicklist|${schema_utils_1.default.CONTEXT_FIELD}.picklistValues.length>0`,
                    `IsPicklistDependent|${schema_utils_1.default.CONTEXT_FIELD}.dependentPicklist`,
                    `PicklistValues|getPicklistValues(${schema_utils_1.default.CONTEXT_FIELD}).join(',')`,
                    `PicklistValueDefault|getPicklistDefaultValue(${schema_utils_1.default.CONTEXT_FIELD})`,
                    `IsLookup|${schema_utils_1.default.CONTEXT_FIELD}.referenceTo.length>0`,
                    `LookupTo|${schema_utils_1.default.CONTEXT_FIELD}.referenceTo.join(',')`,
                    `IsCreateable|${schema_utils_1.default.CONTEXT_FIELD}.createable`,
                    `IsUpdateable|${schema_utils_1.default.CONTEXT_FIELD}.updateable`,
                    `IsEncrypted|${schema_utils_1.default.CONTEXT_FIELD}.encrypted`,
                    `HelpText|${schema_utils_1.default.CONTEXT_FIELD}.inlineHelpText`
                ]);
                this.outputDefMap.set('childRelationships', [
                    `ParentObjectName|${schema_utils_1.default.CONTEXT_SCHEMA}.name`,
                    `ChildObjectName|${schema_utils_1.default.CONTEXT_FIELD}.childSObject`,
                    `LookUpFieldOnChildObject|${schema_utils_1.default.CONTEXT_FIELD}.field`,
                    `ChildRelationShipName|${schema_utils_1.default.CONTEXT_FIELD}.relationshipName`
                ]);
                this.outputDefMap.set('recordTypeInfos', [
                    `SObjectName|${schema_utils_1.default.CONTEXT_SCHEMA}.name`,
                    `RecordTypeName|${schema_utils_1.default.CONTEXT_FIELD}.name`,
                    `RecordTypeLabel|${schema_utils_1.default.CONTEXT_FIELD}.developerName`,
                    `IsMaster|${schema_utils_1.default.CONTEXT_FIELD}.master`
                ]);
                this.excludeFieldIfTrueFilter = '';
            }
            catch (err) {
                reject(err);
            }
            resolve();
        });
    }
}
exports.default = SchemaOptions;
//# sourceMappingURL=schema-options.js.map