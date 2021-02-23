import { OptionsBase } from './options';
import { SfdxCore } from './sfdx-core';

export default class SchemaOptions extends OptionsBase {
    public excludeCustomObjectNames: string[] = [];
    public includeCustomObjectNames: string[] = [];
    public outputDefMap = new Map<string, string[]>();

    public excludeFieldIfTrueFilter: string;

    public getDynamicCode(sheetName: string = null): string {
        let code = 'main(); function main() { const row=[];';

        if (this.excludeFieldIfTrueFilter) {
            code += `if( ${this.excludeFieldIfTrueFilter} ) { return []; } `;
        }
        const outputDefs = sheetName
            ? this.outputDefMap.get(sheetName)
            : this.outputDefMap.get(this.outputDefMap.keys[0]);

        for (const outputDef of outputDefs) {
            code += `row.push(${outputDef.split('|')[1]});`;
        }

        code += 'return row; }';

        return code;
    }

    public getDynamicChildObjectTypeCode(sheetName: string = null): string {
        let code = 'main(); function main() { const row=[];';

        if (this.excludeFieldIfTrueFilter) {
            code += `if( ${this.excludeFieldIfTrueFilter} ) { return []; } `;
        }
        const outputDefs = sheetName
            ? this.outputDefMap.get(sheetName)
            : this.outputDefMap.get(this.outputDefMap.keys()[0]);

        for (const outputDef of outputDefs) {
            const field = outputDef.split('|')[1];
            // Push null to not skew column alignment
            code += `${field} ? row.push(${field}) : row.push(null);`;
        }

        code += 'return row; }';
        return code;
    }

    public async deserialize(serializedOptions: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                if (!serializedOptions) {
                    return null;
                }
                const options = JSON.parse(serializedOptions);
                if (options.excludeFieldIfTrueFilter) {
                    this.excludeFieldIfTrueFilter = options.excludeFieldIfTrueFilter;
                }
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
            } catch (err) {
                reject(err);
            }
        });
    }

    public async serialize(): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                resolve(JSON.stringify({
                    excludeCustomObjectNames: this.excludeCustomObjectNames,
                    includeCustomObjectNames: this.includeCustomObjectNames,
                    excludeFieldIfTrueFilter: this.excludeFieldIfTrueFilter,
                    outputDefMap: Array.from(this.outputDefMap.entries())
                }, null, SfdxCore.jsonSpaces));

            } catch (err) {
                reject(err);
            }
        });
    }

    protected loadDefaults(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.outputDefMap.set('fields', [
                    'SObjectName|schema.name',
                    'Name|item.name',
                    'Label|item.label',
                    'Datatype|item.type',
                    'Length|item.length',
                    'Precision|item.precision',
                    'Scale|item.scale',
                    'Digits|item.digits',
                    'IsCustom|item.custom',
                    'IsDeprecatedHidden|item.deprecatedAndHidden',
                    'IsAutonumber|item.autoNumber',
                    'DefaultValue|item.defaultValue',
                    'IsFormula|item.calculated',
                    'Formula|item.calculatedFormula',
                    'IsRequired|!item.nillable',
                    'IsExternalId|item.externalId',
                    'IsUnique|item.unique',
                    'IsCaseSensitive|item.caseSensitive',
                    'IsPicklist|item.picklistValues.length>0',
                    'IsPicklistDependent|item.dependentPicklist',
                    "PicklistValues|getPicklistValues(field).join(',')",
                    'PicklistValueDefault|getPicklistDefaultValue(field)',
                    'IsLookup|item.referenceTo.length>0',
                    "LookupTo|item.referenceTo.join(',')",
                    'IsCreateable|item.createable',
                    'IsUpdateable|item.updateable',
                    'IsEncrypted|item.encrypted',
                    'HelpText|item.inlineHelpText'
                ]);
                this.outputDefMap.set('recordTypeInfos', [
                    'ParentObjectName|schema.name',
                    'ChildObjectName|item.childSObject',
                    'LookUpFieldOnChildObject|item.field',
                    'ChildRelationShipName|item.relationshipName'
                ]);
                this.outputDefMap.set('childRelationships', [
                    'SObjectName|schema.name',
                    'RecordTypeName|item.name',
                    'RecordTypeLabel|item.developerName',
                    'IsMaster|item.master'
                ]);
                this.excludeFieldIfTrueFilter = '';
            } catch (err) {
                reject(err);
            }
            resolve();
        });
    }
}
