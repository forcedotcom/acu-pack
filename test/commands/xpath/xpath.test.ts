import { promises as fs } from 'fs';
import path = require('path');
import { spawnSync } from 'child_process';
import { expect } from '@salesforce/command/lib/test';
import Utils from '../../../src/lib/utils'
import { XPathOptions } from '../../../src/lib/xpath-options';
import { OptionsFactory } from '../../../src/lib/options-factory';
import Constants from '../../../src/lib/constants';

const optionsPath = 'exit-code-options.json';
const xmlPath = 'exit-code.profile-meta.xml';

beforeEach(async () => {
  const options = await OptionsFactory.get(XPathOptions);
  // load the default values
  options.rules.clear();
  options.rules.set('exit-code.profile-meta.xml', [
    {
      name: 'Bad FieldPermissions',
      xPath: "//*[local-name()='Profile']/*[local-name()='fieldPermissions']/*[local-name()='field']/text()",
      values: [
        'Bad'
      ]
    }
  ]);
  await options.save(optionsPath);
});

afterEach(async () => {
  await Utils.deleteFile(optionsPath);
  await Utils.deleteFile(xmlPath);
});

describe('XPath Tests', function () {
  this.timeout(50000); // Times out due to blocking spawnSync otherwise

  it('Returns Exit Code 0', async () => {
    await fs.writeFile(xmlPath, `<?xml version='1.0' encoding='UTF-8'?>
    <Profile xmlns='${Constants.DEFAULT_XML_NAMESPACE}'>
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
    const result = spawnSync(path.join(path.resolve(process.cwd()), './bin/run.cmd'), [`${Constants.PLUGIN_NAME}:source:xpath`, '-o', optionsPath]);
    expect(result.status).to.equal(0);
    await Utils.deleteFile(xmlPath);
  });
  it('Returns Exit Code 1', async () => {
    await fs.writeFile(xmlPath, `<?xml version='1.0' encoding='UTF-8'?>
    <Profile xmlns='${Constants.DEFAULT_XML_NAMESPACE}'>
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
    const result = spawnSync(path.join(path.resolve(process.cwd()), './bin/run.cmd'), [`${Constants.PLUGIN_NAME}:source:xpath`, '-o', optionsPath]);
    expect(result.status).to.equal(1);
    await Utils.deleteFile(xmlPath);
  });
});
