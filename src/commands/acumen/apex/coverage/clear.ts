import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
import { SfdxQuery } from '../../../../lib/sfdx-query';
import { SfdxClient, RestAction, NO_CONTENT_CODE, ApiKind } from '../../../../lib/sfdx-client';

export default class Clear extends CommandBase {
  public static defaultJobStatusWaitMax = -1;
  public static description = CommandBase.messages.getMessage('apex.coverage.clear.commandDescription');
  // Don't include ApexCodeCoverage as these records appear to be auto-generate if they are deleted;
  public static defaultMetadataTypes = ['ApexCodeCoverageAggregate'];
  public static examples = [
    `$ sfdx acumen:apex:coverage:clear -u myOrgAlias
    Deletes the existing instances of ${Clear.defaultMetadataTypes.join(',')} from the specific Org.`
  ];

  protected static flagsConfig = {
    metadatas: flags.string({
      char: 'm',
      description: CommandBase.messages.getMessage('apex.coverage.clear.metadataFlagDescription', [Clear.defaultMetadataTypes.join(',')])
    }),
    classortriggernames: flags.string({
      char: 'n',
      description: CommandBase.messages.getMessage('apex.coverage.clear.classortriggernamesFlagDescription')
      })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<void> {
    try {
      this.ux.log(`Connecting to Org: ${this.orgAlias}(${this.orgId})`);
      this.ux.log('Checking for pending tests...');

      let recordCount = 0;
      for await (recordCount of SfdxQuery.waitForApexTests(this.orgAlias)) {
        if (recordCount === 0) {
          break;
        }
      }
      if (recordCount !== 0) {
        this.ux.log(`${recordCount} Apex Test(s) are still executing - please try again later.`);
        // Set the proper exit code to indicate violation/failure
        process.exitCode = 1;
        return;
      }

      // Clear Code Coverage Metadata
      const metaDataTypes = this.flags.metadatas
        ? this.flags.metadatas.split(',')
        : Clear.defaultMetadataTypes;

      let whereClause = '';
      if (this.flags.classortriggernames) {
          const names = [...this.flags.classortriggernames.split(',')].map(record => `'${record}'`).join(',');
          whereClause = ` where ApexClassorTrigger.Name in (${names})`;
        }

      this.ux.log('Clearing Code Coverage Data.');
      try {
        for (const metaDataType of metaDataTypes) {
          const query = `SELECT Id FROM ${metaDataType} ${whereClause}`;
          const records = await SfdxQuery.doSoqlQuery(this.orgAlias, query, null, null, true);
          if (records && records.length > 0) {
            this.ux.log(`Clearing ${records.length} ${metaDataType} records...`);
            let counter = 0;
            const sfdxClient = new SfdxClient(this.orgAlias);
            for await (const result of sfdxClient.do(RestAction.DELETE, metaDataType, records, 'Id', ApiKind.TOOLING, [NO_CONTENT_CODE])) {
              this.ux.log(`(${++counter}/${records.length}) Deleted id: ${result}`);
            }
            this.ux.log('Cleared.');
          }
        }
      } catch (err) {
        this.ux.log(`Delete Failed: ${err.message}`);
        this.ux.log('Unable to clear all Code Coverage Data.');
        process.exitCode = 1;
        return;
      }
    } catch (err) {
      throw err;
    } finally {
      this.ux.log('Done.');
    }
  }
}
