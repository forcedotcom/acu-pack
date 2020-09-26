import { promises as fs } from 'fs';
import path = require('path');
import { expect } from '@salesforce/command/lib/test';
import Utils from '../../../src/lib/utils'
import xmlMerge from '../../../src/lib/xml-merge'

describe("Xml-Merge Tests", function () {
  const command = 'package:merge';
  const testPath = './test/lib/merge'
  const source = path.join(testPath, 'package-a.xml');
  const destination = path.join(testPath, 'package-b.xml');

  async function cleanUp() {
    try {
      if (await Utils.pathExistsAsync(source)) {
        await fs.unlink(source);
      }
      if (await Utils.pathExistsAsync(destination)) {
        await fs.unlink(destination);
      }
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  beforeEach(async () => {
    await cleanUp();
    await Utils.copyFile(path.join(testPath, 'package-a.save.xml'), source);
    await Utils.copyFile(path.join(testPath, 'package-b.save.xml'), destination);
  });

  afterEach(async () => {
    await cleanUp();
  });

  describe("parseXmlFromFile Tests", function () {
    it("Can Handle Nulls", async function () {
      expect(await xmlMerge.parseXmlFromFile(null)).is.null;
    });
    it("Can Parse XMl Files", async function () {
      expect(await xmlMerge.parseXmlFromFile(source));
    });
  });
  
  describe('Test XmlMerge', async () => {
    it(`runs ${command}  -s ${source} -d ${destination}`, async () => {
      await xmlMerge.mergeXml(source, destination);

      expect(await Utils.pathExistsAsync(destination));

      const merged = await xmlMerge.parseXmlFromFile(destination);
      expect(merged).not.null;
      expect(merged.Package).not.null;
      expect(merged.Package.types).not.null;
      expect(merged.Package.types.length).equals(4);

      // ApexClass
      let packType = xmlMerge.getType(merged.Package, 'ApexClass');
      expect(packType).not.null;
      expect(packType.members).not.null;
      expect(packType.members.length).equals(6);

      // Report
      packType = xmlMerge.getType(merged.Package, 'Report');
      expect(packType).not.null;
      expect(packType.members).not.null;
      expect(packType.members.length).equals(10);

      // Report
      packType = xmlMerge.getType(merged.Package, 'CustomObject');
      expect(packType).not.null;
      expect(packType.members).not.null;
      expect(packType.members.length).equals(1);

      // Report
      packType = xmlMerge.getType(merged.Package, 'CustomApplication');
      expect(packType).not.null;
      expect(packType.members).not.null;
      expect(packType.members.length).equals(3);
    });
  });
});
