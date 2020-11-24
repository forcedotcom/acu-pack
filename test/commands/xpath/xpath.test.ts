import { promises as fs } from 'fs';
import path = require('path');
import { expect } from '@salesforce/command/lib/test';
import { spawnSync } from 'child_process';
import Utils from '../../../src/lib/utils'
import { XPathOptions } from '../../../src/lib/xpath-options';

const optionsPath = 'exit-code-options.json';
const xmlPath = 'exit-code.profile-meta.xml';

before(async () => {
  const options = new XPathOptions();
  // load the default values
  options.rules.set('exit-code.profile-meta.xml', [
    {
      name: 'Bad FieldPermissions',
      xPath: "//*[local-name()='Profile']/*[local-name()='fieldPermissions']/*[local-name()='field']/text()",
      values: [
        'Bad'
      ]
    }
  ]);
  await fs.writeFile(optionsPath, options.serialize());
});

after(async () => {
  await Utils.deleteFileAsync(optionsPath);
  await Utils.deleteFileAsync(xmlPath);
});

describe("XPath Tests", function () {
  this.timeout(5000); // Times out due to blocking spawnSync otherwise

  it("Returns Exit Code 0", async () => {
    await fs.writeFile(xmlPath, `<?xml version="1.0" encoding="UTF-8"?>
    <Profile xmlns="http://soap.sforce.com/2006/04/metadata">
        <classAccesses>
            <apexClass>MyMJM</apexClass>
            <enabled>false</enabled>
        </classAccesses>
        <custom>false</custom>
        <fieldPermissions>
            <editable>false</editable>
            <field>OK</field>
            <readable>true</readable>
        </fieldPermissions>
    </Profile>`);
    const result = spawnSync(path.join(path.resolve(process.cwd()), './bin/run.cmd'), ['acumen:source:xpath', '-o', optionsPath]);
    expect(result.status).to.equal(0);
    await Utils.deleteFileAsync(xmlPath);
  });
  it("Returns Exit Code 1", async () => {
    await fs.writeFile(xmlPath, `<?xml version="1.0" encoding="UTF-8"?>
    <Profile xmlns="http://soap.sforce.com/2006/04/metadata">
        <classAccesses>
            <apexClass>MyMJM</apexClass>
            <enabled>false</enabled>
        </classAccesses>
        <custom>false</custom>
        <fieldPermissions>
            <editable>false</editable>
            <field>Bad</field>
            <readable>true</readable>
        </fieldPermissions>
    </Profile>`);
    const result = spawnSync(path.join(path.resolve(process.cwd()), './bin/run.cmd'), ['acumen:source:xpath', '-o', optionsPath]);
    expect(result.status).to.equal(1);
    await Utils.deleteFileAsync(xmlPath);
  });
});
