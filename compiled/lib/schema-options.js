"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("./options");
class SchemaOptions extends options_1.OptionsBase {
    constructor() {
        super(...arguments);
        this.excludeCustomObjectNames = [];
        this.includeCustomObjectNames = [];
        this.outputDefs = [];
    }
    getDynamicCode() {
        let code = 'main(); function main() { const row=[];';
        if (this.excludeFieldIfTrueFilter) {
            code += `if( ${this.excludeFieldIfTrueFilter} ) { return []; } `;
        }
        if (this.outputDefs && this.outputDefs.length > 0) {
            for (const outputDef of this.outputDefs[0]) {
                code += `row.push(${outputDef.split('|')[1]});`;
            }
        }
        code += 'return row; }';
        return code;
    }
    getDynamicRecordTypeCode() {
        let code = 'main(); function main() { const row=[];';
        if (this.outputDefs && this.outputDefs.length > 0) {
            for (const recordTypeDef of this.outputDefs[2]) {
                code += `row.push(${recordTypeDef.split('|')[1]});`;
            }
        }
        code += 'return row; }';
        return code;
    }
    getDynamicChildObjectTypeCode() {
        let code = 'main(); function main() { const row=[];';
        if (this.outputDefs && this.outputDefs.length > 0) {
            for (const childObjecType of this.outputDefs[1]) {
                code += `if(${childObjecType.split('|')[1]}) row.push(${childObjecType.split('|')[1]});`;
            }
        }
        code += 'return row; }';
        return code;
    }
    loadDefaults() {
        return new Promise((resolve, reject) => {
            try {
                const fieldKeys = [
                    'SObjectName|schema.name',
                    'Name|field.name',
                    'Label|field.label',
                    'Datatype|field.type',
                    'Length|field.length',
                    'Precision|field.precision',
                    'Scale|field.scale',
                    'Digits|field.digits',
                    'IsCustom|field.custom',
                    'IsDeprecatedHidden|field.deprecatedAndHidden',
                    'IsAutonumber|field.autoNumber',
                    'DefaultValue|field.defaultValue',
                    'IsFormula|field.calculated',
                    'Formula|field.calculatedFormula',
                    'IsRequired|!field.nillable',
                    'IsExternalId|field.externalId',
                    'IsUnique|field.unique',
                    'IsCaseSensitive|field.caseSensitive',
                    'IsPicklist|field.picklistValues.length>0',
                    'IsPicklistDependent|field.dependentPicklist',
                    "PicklistValues|getPicklistValues(field).join(',')",
                    'PicklistValueDefault|getPicklistDefaultValue(field)',
                    'IsLookup|field.referenceTo.length>0',
                    "LookupTo|field.referenceTo.join(',')",
                    'IsCreateable|field.createable',
                    'IsUpdateable|field.updateable',
                    'IsEncrypted|field.encrypted',
                    'HelpText|field.inlineHelpText'
                ];
                const childObjectKeys = [
                    'ParentObjectName|schema.name',
                    'ChildObjectName|childRelationship.childSObject',
                    'LookUpFieldonChildObject|childRelationship.field',
                    'ChildRelationShipName|childRelationship.relationshipName'
                ];
                const recordTypeDefs = [
                    'SObjectName|schema.name',
                    'RecordTypeName|recordTypeInfo.name',
                    'RecordTypeLabel|recordTypeInfo.developerName',
                    'IsMaster|recordTypeInfo.master'
                ];
                this.outputDefs = [fieldKeys, childObjectKeys, recordTypeDefs];
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