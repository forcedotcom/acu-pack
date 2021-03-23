import { OptionsBase } from './options';
import { SfdxCore } from './sfdx-core';
import SchemaUtils from './schema-utils';

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

        if (outputDefs) {
            for (const outputDef of outputDefs) {
                code += `row.push(${outputDef.split('|')[1]});`;
            }
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
                    `SObjectName|${SchemaUtils.CONTEXT_SCHEMA}.name`,
                    `Name|${SchemaUtils.CONTEXT_FIELD}.name`,
                    `Label|${SchemaUtils.CONTEXT_FIELD}.label`,
                    `Datatype|${SchemaUtils.CONTEXT_FIELD}.type`,
                    `Length|${SchemaUtils.CONTEXT_FIELD}.length`,
                    `Precision|${SchemaUtils.CONTEXT_FIELD}.precision`,
                    `Scale|${SchemaUtils.CONTEXT_FIELD}.scale`,
                    `Digits|${SchemaUtils.CONTEXT_FIELD}.digits`,
                    `IsCustom|${SchemaUtils.CONTEXT_FIELD}.custom`,
                    `IsDeprecatedHidden|${SchemaUtils.CONTEXT_FIELD}.deprecatedAndHidden`,
                    `IsAutonumber|${SchemaUtils.CONTEXT_FIELD}.autoNumber`,
                    `DefaultValue|${SchemaUtils.CONTEXT_FIELD}.defaultValue`,
                    `IsFormula|${SchemaUtils.CONTEXT_FIELD}.calculated`,
                    `Formula|${SchemaUtils.CONTEXT_FIELD}.calculatedFormula`,
                    `IsRequired|!${SchemaUtils.CONTEXT_FIELD}.nillable`,
                    `IsExternalId|${SchemaUtils.CONTEXT_FIELD}.externalId`,
                    `IsUnique|${SchemaUtils.CONTEXT_FIELD}.unique`,
                    `IsCaseSensitive|${SchemaUtils.CONTEXT_FIELD}.caseSensitive`,
                    `IsPicklist|${SchemaUtils.CONTEXT_FIELD}.picklistValues.length>0`,
                    `IsPicklistDependent|${SchemaUtils.CONTEXT_FIELD}.dependentPicklist`,
                    `PicklistValues|getPicklistValues(${SchemaUtils.CONTEXT_FIELD}).join(',')`,
                    `PicklistValueDefault|getPicklistDefaultValue(${SchemaUtils.CONTEXT_FIELD})`,
                    `IsLookup|${SchemaUtils.CONTEXT_FIELD}.referenceTo.length>0`,
                    `LookupTo|${SchemaUtils.CONTEXT_FIELD}.referenceTo.join(',')`,
                    `IsCreateable|${SchemaUtils.CONTEXT_FIELD}.createable`,
                    `IsUpdateable|${SchemaUtils.CONTEXT_FIELD}.updateable`,
                    `IsEncrypted|${SchemaUtils.CONTEXT_FIELD}.encrypted`,
                    `HelpText|${SchemaUtils.CONTEXT_FIELD}.inlineHelpText`
                ]);
                this.outputDefMap.set('childRelationships', [
                    `ParentObjectName|${SchemaUtils.CONTEXT_SCHEMA}.name`,
                    `ChildObjectName|${SchemaUtils.CONTEXT_FIELD}.childSObject`,
                    `LookUpFieldOnChildObject|${SchemaUtils.CONTEXT_FIELD}.field`,
                    `ChildRelationShipName|${SchemaUtils.CONTEXT_FIELD}.relationshipName`
                ]);
                this.outputDefMap.set('recordTypeInfos', [
                    `SObjectName|${SchemaUtils.CONTEXT_SCHEMA}.name`,
                    `RecordTypeName|${SchemaUtils.CONTEXT_FIELD}.name`,
                    `RecordTypeLabel|${SchemaUtils.CONTEXT_FIELD}.developerName`,
                    `IsMaster|${SchemaUtils.CONTEXT_FIELD}.master`
                ]);
                this.excludeFieldIfTrueFilter = '';
            } catch (err) {
                reject(err);
            }
            resolve();
        });
    }
}
