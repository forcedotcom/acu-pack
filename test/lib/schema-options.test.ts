import { expect } from '@salesforce/command/lib/test';
import SchemaOptions from '../../src/lib/schema-options'

const outputDefs = [
  'SchemaName|schema.name',
  'FieldName|field.name',
  'Label|field.label',
  'Datatype|field.type',
  'Length|field.length',
  'HelpText|field.inlineHelpText'
];

describe("SchemaOptions Tests", function () {
  it('Creates New Object', function () {
    const testOptions = new SchemaOptions();
    // It contains default data
    expect(testOptions).is.not.null;
    expect(testOptions.outputDefs).is.not.null;
    expect(testOptions.outputDefs.length).equals(0);
    expect(testOptions.excludeFieldIfTrueFilter).is.undefined;
  });
  it('Can Handle Bad Json', function () {
    const testOptions = new SchemaOptions({
      testField: 'test'
    });
    expect(testOptions).is.not.null;
    expect(testOptions.outputDefs).is.not.null;
    expect(testOptions.outputDefs.length).equals(0);
    expect(testOptions.excludeFieldIfTrueFilter).is.undefined;
  });
  it('Loads Partial Json', function () {
    const testOptions = new SchemaOptions({
      outputDefs
    });
    expect(testOptions).is.not.null;
    expect(testOptions.outputDefs).is.not.null;
    expect(testOptions.outputDefs.length).equals(outputDefs.length);
    expect(testOptions.excludeFieldIfTrueFilter).is.undefined;
  });
  it('Loads Full Json', function () {
    const testOptions = new SchemaOptions({
      outputDefs,
      excludeFieldIfTrueFilter: ''
    });
    expect(testOptions).is.not.null;
    expect(testOptions.outputDefs).is.not.null;
    expect(testOptions.outputDefs.length).equals(outputDefs.length);
    expect(testOptions.excludeFieldIfTrueFilter).is.not.null;
  });
  describe("getDynamicCode Tests", function () {
    it("Works without outputDefs", function () {
      const testOptions = new SchemaOptions();
      const dynamicCode = testOptions.getDynamicCode();
      expect(dynamicCode).is.not.null;
      expect(dynamicCode).to.equal('main(); function main() { const row=[];return row; }');
    });
    it("Works with outputDefs", function () {
      const testOptions = new SchemaOptions({
        outputDefs
      });
      const dynamicCode = testOptions.getDynamicCode();

      expect(dynamicCode).is.not.null;
      expect(dynamicCode).to.contain('main(); function main() { const row=[];');

      expect(dynamicCode).to.not.contain(`if( ${testOptions.excludeFieldIfTrueFilter} ) { return []; } `);

      for (const outputDef of testOptions.outputDefs) {
        expect(dynamicCode).to.contain(`row.push(${outputDef.split('|')[1]});`);
      }
    });
    it("Works with excludeFieldIfTrueFilter", function () {
      const testOptions = new SchemaOptions({
        outputDefs,
        excludeFieldIfTrueFilter: 'field.name == "mjm"'
      });
      const dynamicCode = testOptions.getDynamicCode();

      expect(dynamicCode).is.not.null;
      expect(dynamicCode).to.contain('main(); function main() { const row=[];');

      expect(dynamicCode).to.contain(`if( ${testOptions.excludeFieldIfTrueFilter} ) { return []; } `);

      for (const outputDef of testOptions.outputDefs) {
        expect(dynamicCode).to.contain(`row.push(${outputDef.split('|')[1]});`);
      }
    });
  });
});
