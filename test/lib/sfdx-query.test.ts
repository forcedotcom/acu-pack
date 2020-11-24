import { expect } from '@salesforce/command/lib/test';
import { SfdxQuery, SfdxCodeCoverage } from '../../src/lib/sfdx-query';

// NOTE: These tests might fail without an authorized Org alias
const orgAlias = null; //'ACUDEV';
describe('Sfdx Query Tests', () => {
  describe('getApexTestClassesAsync Tests', function () {
    this.timeout(15000); // Times out due to query
    it('Can Handle Null', async function () {
      expect(await SfdxQuery.getApexTestClassesAsync(null)).to.be.null;
      expect(await SfdxQuery.getApexTestClassesAsync(null, null)).to.be.null;
      expect(await SfdxQuery.getApexTestClassesAsync(null, [''])).to.be.null;
    });
    it('Can get Test Classes', async function () {
      if (!orgAlias) {
        this.skip();
      }
      const testClasses = await SfdxQuery.getApexTestClassesAsync(orgAlias);
      expect(testClasses).to.not.be.null;
      expect(testClasses).to.be.instanceOf(Array);
      expect(testClasses.length).to.not.equal(0);
    });
    it('Can get classes with no Tests By Namespace', async function () {
      if (!orgAlias) {
        this.skip();
      }
      const testClasses = await SfdxQuery.getApexTestClassesAsync(orgAlias, ['ltngsharing']);
      expect(testClasses).to.not.be.null;
      expect(testClasses).to.be.instanceOf(Array);
      expect(testClasses.length).to.equal(0);
    });
  });
  describe('getCodeCoverageAsync Tests', function () {
    this.timeout(15000); // Times out due to query

    it('Can Handle Null', async function () {
      expect(await SfdxQuery.getCodeCoverageAsync(null)).to.be.null;
    });
    it('Can get Code Coverage', async function () {
      if (!orgAlias) {
        this.skip();
      }
      const codeCoverage = await SfdxQuery.getCodeCoverageAsync(orgAlias);
      codeCoverage.calculateCodeCoverage();
      expect(codeCoverage).to.not.be.null;
      expect(codeCoverage).to.be.instanceOf(SfdxCodeCoverage);
      expect(codeCoverage.codeCoverage).to.be.instanceOf(Array);
      expect(codeCoverage.codeCoverage.length).to.not.equal(0);
      expect(codeCoverage.codeCoveragePercent).to.not.equal(0);
    });
  });
});
