import { expect } from '@salesforce/command/lib/test';
import { OptionsFactory } from '../../src/lib/options-factory';
import SchemaOptions from '../../src/lib/schema-options';
import SchemaUtils from '../../src/lib/schema-utils';

describe('SchemaUtils Tests', function() {
  const schema = {
    name: 'Schema0',
    fields: [
      {
        label: 'Field 0',
        length: 1,
        mask: null,
        maskType: null,
        name: 'Field0',
        inlineHelpText: 'Help Text 0'
      },
      {
        label: 'Field 1',
        length: 2,
        mask: null,
        maskType: null,
        name: 'Field1',
        inlineHelpText: 'Help Text 1'
      }],
      childRelationships: [{
        childSObject: 'childObject',
        field: 'field1__c',
        relationshipName: 'fields__r'
      } ],
      recordTypeInfos: [{
        name: 'recordType',
        developerName: 'recordType',
        master: true
      },
      {
        name: 'recordType1',
        developerName: 'recordType1',
        master: false
      }
      ]
  };
  let testOptions: SchemaOptions;

  beforeEach(async function() {
    testOptions = await OptionsFactory.get(SchemaOptions);
    testOptions.outputDefs = [[
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
    testOptions.excludeFieldIfTrueFilter = '';
  });
  describe('getDynamicSchemaData Tests', function() {
    it('Can Handle Nulls', function() {
      expect(() => Array.from(SchemaUtils.getDynamicSchemaData(null, null))).to.throw('The schema argument cannot be null.');
    });
    it('Can Handle bad schema', function() {
      const schema = {};
      schema['test'] = [];
      expect(() => Array.from(SchemaUtils.getDynamicSchemaData(schema, null))).to.throw('The schema argument does not contains a fields member.');
    });

    it('Can Handle Null code', function() {
      const schema = {};
      schema['fields'] = [];
      expect(() => Array.from(SchemaUtils.getDynamicSchemaData(schema, null))).to.throw('The dynamicCode argument cannot be null.');
    });

    it('Works with schema', function() {
      const code = testOptions.getDynamicCode();
      const childObjectCode = testOptions.getDynamicChildObjectTypeCode();
      const recordTypeCode = testOptions.getDynamicRecordTypeCode();
      testOptions.excludeFieldIfTrueFilter = '';
      for (const row of SchemaUtils.getDynamicSchemaData(schema, code)) {
        expect(row).is.not.null;
        expect(row.length).equals(testOptions.outputDefs[0].length);
      }
      for (const row of SchemaUtils.getDynamicRecordTypeData(schema, recordTypeCode)) {
        expect(row).is.not.null;
        expect(row.length).equals(testOptions.outputDefs[2].length);
      }

      for (const row of SchemaUtils.getDynamicChildObjectTypeData(schema, childObjectCode)) {
        expect(row).is.not.null;
        expect(row.length).equals(testOptions.outputDefs[1].length);
      }

    });
    it('Works with schema and exclude filter', function() {
      testOptions.excludeFieldIfTrueFilter = 'field.label == "Field 0"';
      const code = testOptions.getDynamicCode();
      const rows = [];
      for (const row of SchemaUtils.getDynamicSchemaData(schema, code)) {
        expect(row).is.not.null;
        if (row.length != 0) {
          expect(row.length).equals(testOptions.outputDefs[0].length);
          rows.push(row);
        }
      }
      expect(rows.length).equals(schema.fields.length - 1);
    });
  });
});
