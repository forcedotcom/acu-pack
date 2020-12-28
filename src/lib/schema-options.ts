import { OptionsBase } from './options';

export default class SchemaOptions extends OptionsBase {
    public outputDefs = [];

    public excludeFieldIfTrueFilter: string;

    public getDynamicCode(): string {
        let code = 'main(); function main() { const row=[];';

        if (this.excludeFieldIfTrueFilter) {
            code += `if( ${this.excludeFieldIfTrueFilter} ) { return []; } `;
        }
        for (const outputDef of this.outputDefs) {
            code += `row.push(${outputDef.split('|')[1]});`;
        }
        code += 'return row; }';

        return code;
    }

    protected loadDefaults(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.outputDefs = [
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
                this.excludeFieldIfTrueFilter = '';
            } catch (err) {
                reject(err);
            }
            resolve();
        });
    }
}
