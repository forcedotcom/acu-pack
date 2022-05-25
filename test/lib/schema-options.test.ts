import { expect } from '@salesforce/command/lib/test';
import { OptionsFactory } from '../../src/lib/options-factory';
import SchemaOptions from '../../src/lib/schema-options';
import SchemaUtils from '../../src/lib/schema-utils';

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
      expect(dynamicCode).is.not.null;
      expect(dynamicCode).to.equal('main(); function main() { const row=[];return row; }');
    });
    it('Works with outputDefs', async function() {
      const testOptions = await OptionsFactory.get(SchemaOptions);
      const dynamicCode = testOptions.getDynamicCode('fields');
      
      expect(dynamicCode).is.not.null;
      expect(dynamicCode).to.contain('main(); function main() { const row=[];');
      expect(dynamicCode).to.not.contain(`if( ${testOptions.excludeFieldIfTrueFilter} ) { return []; } `);

      const recordTypeInfosDynamicCode = testOptions.getDynamicCode('recordTypeInfos');
      expect(recordTypeInfosDynamicCode).is.not.null;
      expect(recordTypeInfosDynamicCode).to.contain('main(); function main() { const row=[];');
      expect(recordTypeInfosDynamicCode).to.not.contain(`if( ${testOptions.excludeFieldIfTrueFilter} ) { return []; } `);

      const childObjectDynamicCode = testOptions.getDynamicCode('childRelationships');
      expect(childObjectDynamicCode).is.not.null;
      expect(childObjectDynamicCode).to.contain('main(); function main() { const row=[];');
      expect(childObjectDynamicCode).to.not.contain(`if( ${testOptions.excludeFieldIfTrueFilter} ) { return []; } `);

      for (const outputDef of testOptions.outputDefMap.get('fields')) {
        if( !outputDef.includes(SchemaUtils.ENTITY_DEFINITION)) {
          expect(dynamicCode).to.contain(`row.push(${outputDef.split('|')[1]});`);
        }
      }

      for (const outputDef of testOptions.outputDefMap.get('recordTypeInfos')) {
        expect(recordTypeInfosDynamicCode).to.contain(`row.push(${outputDef.split('|')[1]});`);
      }

      for (const outputDef of testOptions.outputDefMap.get('childRelationships')) {
        const field = outputDef.split('|')[1];
        expect(childObjectDynamicCode).to.contain(`row.push(${field});`);
      }
      
    });
    it('Works with excludeFieldIfTrueFilter', async function() {
      const testOptions = await OptionsFactory.get(SchemaOptions);
      testOptions.excludeFieldIfTrueFilter = 'item.name == "mjm"';
      const dynamicCode = testOptions.getDynamicCode('fields');

      expect(dynamicCode).is.not.null;
      expect(dynamicCode).to.contain('main(); function main() { const row=[];');

      expect(dynamicCode).to.contain(`if( ${testOptions.excludeFieldIfTrueFilter} ) { return []; } `);

      for (const outputDef of testOptions.outputDefMap.get('fields')) {
        if( !outputDef.includes(SchemaUtils.ENTITY_DEFINITION)) {
          expect(dynamicCode).to.contain(`row.push(${outputDef.split('|')[1]});`);
        }
      }
    });
  });
});
