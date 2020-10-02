import SchemaOptions from './schema-options';

export class DictionaryOptions extends SchemaOptions {
    public outputDefs = [
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
    public excludeFieldIfTrueFilter = '';

}
