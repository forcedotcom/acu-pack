import { expect } from '@salesforce/command/lib/test';
import { OptionsFactory } from '../../src/lib/options-factory';
import SchemaOptions from '../../src/lib/schema-options';

const outputDefs = [[
  'SchemaName|schema.name',
  'FieldName|field.name',
  'Label|field.label',
  'Datatype|field.type',
  'Length|field.length',
  'HelpText|field.inlineHelpText'
],
[
  'ParentObjectName|schema.name',
  'ChildObjectName|childRelationship.childSObject',
  'LookUpFieldonChildObject|childRelationship.field',
  'ChildRelationShipName|childRelationship.relationshipName'
],
[
  'SObjectName|schema.name',
  'RecordTypeName|recordTypeInfo.name',
  'RecordTypeLabel|recordTypeInfo.developerName',
  'IsMaster|recordTypeInfo.master'
]
];

describe('SchemaOptions Tests', function() {
  it('Creates New Object', async function() {
    const testOptions = await OptionsFactory.get(SchemaOptions);
    // It contains default data
    expect(testOptions).is.not.null;
    expect(testOptions.outputDefMap).is.not.null;
    for(const [name, outputDefs] of testOptions.outputDefMap){
      expect(name).is.not.null;
      expect(outputDefs).is.not.null;  
      expect(outputDefs.length).to.not.equal(0);
    }
    expect(testOptions.excludeFieldIfTrueFilter).to.equal('');
  });
  describe('getDynamicCode Tests', function() {
    it('Works without outputDefs', async function() {
      const testOptions = await OptionsFactory.get(SchemaOptions);
      testOptions.outputDefMap = new Map<string,string[]>();
      const dynamicCode = testOptions.getDynamicCode();
      const childObjectDynamicCode = testOptions.getDynamicChildObjectTypeCode();
      expect(dynamicCode).is.not.null;
      expect(childObjectDynamicCode).is.not.null;
      expect(dynamicCode).to.equal('main(); function main() { const row=[];return row; }');
      expect(childObjectDynamicCode).to.equal('main(); function main() { const row=[];return row; }');
    });
    it('Works with outputDefs', async function() {
      const testOptions = await OptionsFactory.get(SchemaOptions);
      testOptions.outputDefs = outputDefs;
      const dynamicCode = testOptions.getDynamicCode();
      const childObjectDynamicCode = testOptions.getDynamicChildObjectTypeCode();
      expect(dynamicCode).is.not.null;
      expect(dynamicCode).to.contain('main(); function main() { const row=[];');
      expect(dynamicCode).to.not.contain(`if( ${testOptions.excludeFieldIfTrueFilter} ) { return []; } `);

      for (const outputDef of testOptions.outputDefs[0]) {
        expect(dynamicCode).to.contain(`row.push(${outputDef.split('|')[1]});`);
      }
      for (const outputDef of testOptions.outputDefs[1]) {
        expect(childObjectDynamicCode).to.contain(`row.push(${outputDef.split('|')[1]});`);
      }
      for (const outputDef of testOptions.outputDefs[2]) {
        expect(recordTypeDynamicCode).to.contain(`row.push(${outputDef.split('|')[1]});`);
      }
    });
    it('Works with excludeFieldIfTrueFilter', async function() {
      const testOptions = await OptionsFactory.get(SchemaOptions);
      testOptions.outputDefs = outputDefs[0];
      testOptions.excludeFieldIfTrueFilter = 'field.name == "mjm"';
      const dynamicCode = testOptions.getDynamicCode();

      expect(dynamicCode).is.not.null;
      expect(dynamicCode).to.contain('main(); function main() { const row=[];');

      expect(dynamicCode).to.contain(`if( ${testOptions.excludeFieldIfTrueFilter} ) { return []; } `);

      for (const outputDef of testOptions.outputDefs[0]) {
        expect(dynamicCode).to.contain(`row.push(${outputDef.split('|')[1]});`);
      }
    });
  });
});
