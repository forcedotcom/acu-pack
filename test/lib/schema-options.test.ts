import { expect } from '@salesforce/command/lib/test';
import SchemaOptions from '../../src/lib/schema-options'

class TestSchemaOptions extends SchemaOptions {
  public outputDefs = [
    'SchemaName|schema.name',
    'FieldName|field.name',
    'Label|field.label',
    'Datatype|field.type',
    'Length|field.length',
    'HelpText|field.inlineHelpText'
  ];
};

describe("SchemaOptions Tests", function () {
  it('Creates New Object', function () {
    const testOptions = new TestSchemaOptions();
    // It contains default data
    expect(testOptions).is.not.null;
    expect(testOptions.outputDefs).is.not.null;
    expect(testOptions.outputDefs.length).equals(0);
    expect(testOptions.excludeFieldIfTrueFilter).is.undefined;
  });
  it('Loads Defaults', function () {
    const testOptions = new TestSchemaOptions();
    expect(testOptions.outputDefs.length).does.not.equal(0);
    expect(testOptions.excludeFieldIfTrueFilter).is.not.null;
  });
  describe("getDynamicCode Tests", function () {
    it("Works without loadDefaults", function () {
      const testOptions = new TestSchemaOptions();
      const dynamicCode = testOptions.getDynamicCode();
      expect(dynamicCode).is.not.null;
      expect(dynamicCode).to.equal('main(); function main() { const row=[];return row; }');
    });

    it("Works with loadDefaults", function () {
      const testOptions = new TestSchemaOptions();
      const dynamicCode = testOptions.getDynamicCode();

      expect(dynamicCode).is.not.null;
      expect(dynamicCode).to.contain('main(); function main() { const row=[];');

      expect(dynamicCode).to.not.contain(`if( ${testOptions.excludeFieldIfTrueFilter} ) { return row; } `);

      for (const outputDef of testOptions.outputDefs) {
        expect(dynamicCode).to.contain(`row.push(${outputDef.split('|')[1]});`);
      }
    });
  });
});
