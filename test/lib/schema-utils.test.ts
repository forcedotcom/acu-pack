import { expect } from '@salesforce/command/lib/test';
import SchemaOptions from '../../src/lib/schema-options'
import SchemaUtils from '../../src/lib/schema-utils'

describe("SchemaUtils Tests", function () {
  describe("getDynamicSchemaData Tests", function () {
    it("Can Handle Nulls", function () {
      expect(() => Array.from(SchemaUtils.getDynamicSchemaData(null,null))).to.throw('The schema argument cannot be null.');
    });
    it("Can Handle bad schema", function () {
      const schema = {};
      schema['test'] = [];
      expect(() => Array.from(SchemaUtils.getDynamicSchemaData(schema,null))).to.throw('The schema argument does not contains a fields member.');
    });

    it("Can Handle Null code", function () {
      const schema = {};
      schema['fields'] = [];
      expect(() => Array.from(SchemaUtils.getDynamicSchemaData(schema,null))).to.throw('The dynamicCode argument cannot be null.');
    });

    it("Works with loadDefaults", function () {
      const schema = {
        name: 'Schema0',
        fields: [
          {
            label: 'Field 0',
            length: 1,
            mask: null,
            maskType: null,
            name: 'Field0',
            inlineHelpText: 'Help Text 0',
          },
          {
            label: 'Field 1',
            length: 2,
            mask: null,
            maskType: null,
            name: 'Field1',
            inlineHelpText: 'Help Text 1',
          }],
      };
      const testOptions = new SchemaOptions({
        outputDefs: [
          'SchemaName|schema.name',
          'FieldName|field.name',
          'Label|field.label',
          'Datatype|field.type',
          'Length|field.length',
          'HelpText|field.inlineHelpText'
        ],
        excludeFieldIfTrueFilter: ''
      });
      const code = testOptions.getDynamicCode();
      for (const row of SchemaUtils.getDynamicSchemaData(schema, code)) {
        expect(row).is.not.null;
        expect(row.length).equals(testOptions.outputDefs.length);
      }
    });
  });
});
