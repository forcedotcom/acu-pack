import { expect } from '@salesforce/command/lib/test';
import { SfdxCore } from '../../src/lib/sfdx-core';

describe('Sfdx Core Tests', () => {
  describe('getPackageBase Tests', function () {
    it('Is Not Null', function () {
      expect(SfdxCore.getPackageBase()).is.not.null;
    });
    it('Has Package', function () {
      expect(SfdxCore.getPackageBase().Package);
    });
    it('Has Package.types', function () {
      expect(SfdxCore.getPackageBase().Package.types);
      expect(SfdxCore.getPackageBase().Package.types.length).equals(0);
    });
    it('Has Package.version', function () {
      expect(SfdxCore.getPackageBase().Package.version);
      expect(SfdxCore.getPackageBase().Package.version.length).greaterThan(0);
    });
  });
  describe('createPackage Tests', function () {
    let packMap;
    before(() => {
      packMap = new Map<string, string[]>();
      packMap.set('t1', ['t1m1', 't1m2', 't1m3', 't1m4']);
      packMap.set('t2', ['t2m1', 't2m2', 't2m3', 't2m4']);
    });
    it('Is Not Null', function () {
      expect(SfdxCore.createPackage(packMap)).is.not.null;
    });
    it('Has Package', function () {
      expect(SfdxCore.createPackage(packMap).Package);
    });
    it('Has Package.types', function () {
      const pack = SfdxCore.createPackage(packMap);
      expect(pack.Package.types);
      expect(pack.Package.types.length).equals(2);
    });
    it('Has Package.type.mmebrs', function () {
      const pack = SfdxCore.createPackage(packMap);
      expect(pack.Package.types);
      for (let type of pack.Package.types) {
        expect(type.members.length).equals(4);
      }
    });
    it('Has Package.version', function () {
      const pack = SfdxCore.createPackage(packMap);
      expect(pack.Package.version);
      expect(pack.Package.version.length).greaterThan(0);
    });
  });
});
