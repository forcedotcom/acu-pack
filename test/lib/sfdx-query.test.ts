import { expect } from '@salesforce/command/lib/test';
import { SfdxQuery, SfdxCodeCoverage } from '../../src/lib/sfdx-query';
import Setup from '../lib/setup';

const orgAlias = Setup.orgAlias;
describe('Sfdx Query Tests', () => {
  describe('getApexTestClasses Tests', function () {
    this.timeout(15000); // Times out due to query
    it('Can Handle Null', async function () {
      expect(await SfdxQuery.getApexTestClasses(null)).to.be.null;
      expect(await SfdxQuery.getApexTestClasses(null, null)).to.be.null;
      expect(await SfdxQuery.getApexTestClasses(null, [''])).to.be.null;
    });
    it('Can get Test Classes', async function () {
      if (!orgAlias) {
        this.skip();
      }
      const testClasses = await SfdxQuery.getApexTestClasses(orgAlias);
      expect(testClasses).to.not.be.null;
      expect(testClasses).to.be.instanceOf(Array);
      expect(testClasses.length).to.not.equal(0);
    });
    it('Can get classes with no Tests By Namespace', async function () {
      if (!orgAlias) {
        this.skip();
      }
      const testClasses = await SfdxQuery.getApexTestClasses(orgAlias, ['ltngsharing']);
      expect(testClasses).to.not.be.null;
      expect(testClasses).to.be.instanceOf(Array);
      expect(testClasses.length).to.equal(0);
    });
  });
  describe('getCodeCoverage Tests', function () {
    this.timeout(15000); // Times out due to query

    it('Can Handle Null', async function () {
      expect(await SfdxQuery.getCodeCoverage(null)).to.be.null;
    });
    it('Can get Code Coverage', async function () {
      if (!orgAlias) {
        this.skip();
      }
      const codeCoverage = await SfdxQuery.getCodeCoverage(orgAlias);
      codeCoverage.calculateCodeCoverage();
      expect(codeCoverage).to.not.be.null;
      expect(codeCoverage).to.be.instanceOf(SfdxCodeCoverage);
      expect(codeCoverage.codeCoverage).to.be.instanceOf(Array);
      expect(codeCoverage.codeCoverage.length).to.not.equal(0);
      expect(codeCoverage.codeCoveragePercent).to.not.equal(0);
    });
  });
});
