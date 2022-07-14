import path = require('path');
import { spawnSync } from 'child_process';
import { expect } from '@salesforce/command/lib/test';
import Constants from '../../../../src/lib/constants';

describe('Test Exception handler', function () {
  this.timeout(0); // Times out due to blocking spawnSync otherwise
  it('Handles Bogus Path and set exit code', () => {
    const result = spawnSync(path.join(path.resolve(process.cwd()), './bin/run.cmd'), [`${Constants.PLUGIN_NAME}:package:permissions`, '-x blah/blah/package.xml']);
    expect(result.status).to.equal(1);
  });
});
