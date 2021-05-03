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
      await Utils.deleteFile(source);
      await Utils.deleteFile(destination);
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

  describe('Test XmlMerge', async () => {
    it("Can Handle Empty package", async function () {
      let source = {
        Package: {
          version: "49.0"
        }
      };
      const parsed = await Utils.readObjectFromXmlFile(destination);
      const merged = xmlMerge.mergeObjects(source, parsed);
      expect(merged).not.null;
      expect(merged.Package).not.null;
      expect(merged.Package.types).not.null;
      expect(merged.Package.types.length).equals(parsed.Package.types.length);
    });
    it(`runs ${command}  -s ${source} -d ${destination}`, async () => {
      await xmlMerge.mergeXmlFiles(source, destination);

      expect(await Utils.pathExists(destination));

      const merged = await Utils.readObjectFromXmlFile(destination);
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
