import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
import { SfdxQuery } from '../../../../lib/sfdx-query';
import { SfdxTasks } from '../../../../lib/sfdx-tasks';

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
    })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<void> {
    const username = this.flags.targetusername;
    const orgId = this.org.getOrgId();
    try {
      this.ux.log(`Connecting to Org: ${username}(${orgId})`);
      this.ux.log('Checking for pending tests...');

      let recordCount = 0;
      for await (recordCount of SfdxQuery.waitForApexTestsAsync(username)) {
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

      this.ux.log('Clearing Code Coverage Data.');
      let hasFailures = false;
      for (const metaDataType of metaDataTypes) {
        const query = `SELECT Id FROM ${metaDataType}`;
        const records = await SfdxQuery.doSoqlQueryAsync(username, query, null, null, true);
        this.ux.log(`Clearing ${records.length} ${metaDataType} records...`);
        let counter = 0;
        for (const record of records) {
          const result = await SfdxTasks.deleteRecordById(username, metaDataType, record.Id, true);
          if (!result.success) {
            this.ux.log(`(${++counter}/${records.length}) Delete Failed id: ${record.Id} errors: ${result.errors.join(',')}`);
            hasFailures = true;
          } else {
            this.ux.log(`(${++counter}/${records.length}) Deleted id: ${record.Id}`);
          }
        }
        this.ux.log('Cleared.');
      }

      if (hasFailures) {
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
