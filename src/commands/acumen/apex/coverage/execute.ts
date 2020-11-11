import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
import { SfdxQuery } from '../../../../lib/sfdx-query';
import { SfdxTasks } from '../../../../lib/sfdx-tasks';

export default class Execute extends CommandBase {

  public static defaultJobStatusWaitMax = 0;
  public static description = CommandBase.messages.getMessage('apex.coverage.execute.commandDescription');
  public static examples = [
    `$ sfdx acumen:apex:coverage:execute -u myOrgAlias
    Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics.`,
    `$ sfdx acumen:apex:coverage:execute -u myOrgAlias -w 30
    Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics and waits up to 30 minutes for test completion.`
  ];

  protected static flagsConfig = {
    wait: flags.integer({
      char: 'w',
      description: CommandBase.messages.getMessage('apex.coverage.execute.waitDescription')
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

      // Execute tests (with CodeCoverage) ?
      this.ux.log('Gathering Test ApexClasses...');
      const testClasses = await SfdxQuery.getApexTestClassesAsync(username);
      if (testClasses.length === 0) {
        this.ux.log(`No Test ApexClasses exist for ${username}`);
        return;
      }

      // Enqueue the Apex tests
      let jobInfo = await SfdxTasks.enqueueApexTestsAsync(username, testClasses);
      if (!jobInfo) {
        this.ux.log('An unknown error occurred enqueuing Apex Tests');
        process.exitCode = 1;
        return;
      }

      const waitCountMaxSeconds = (this.flags.wait || Execute.defaultJobStatusWaitMax) * 60;
      if (!jobInfo.isDone()) {
        for await (jobInfo of SfdxTasks.waitForJobAsync(username, jobInfo, waitCountMaxSeconds)) {
          this.ux.log(`${new Date().toJSON()} state: ${jobInfo.state} id: ${jobInfo.id} batch: ${jobInfo.batchId} isDone: ${jobInfo.isDone()}`);
        }

        if (!jobInfo.isDone()) {
          this.ux.log('Timeout while waiting for Apex Test Job to Complete:');
          this.ux.log(JSON.stringify(jobInfo));
          process.exitCode = 1;
          return;
        }
      }
      this.ux.log('Apex Tests Started');
      if (waitCountMaxSeconds !== 0) {
        const createdDate = jobInfo.createdDate || new Date().toJSON();
        for await (recordCount of SfdxQuery.waitForApexTestsAsync(username, waitCountMaxSeconds, createdDate)) {
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
        this.ux.log('Apex Tests Completed');
      }

    } catch (err) {
      throw err;
    } finally {
      this.ux.log('Done.');
    }
  }
}
