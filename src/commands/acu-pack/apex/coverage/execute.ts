import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
import { SfdxQuery } from '../../../../lib/sfdx-query';
import { SfdxTasks } from '../../../../lib/sfdx-tasks';

export default class Execute extends CommandBase {
  public static defaultJobStatusWaitMax = -1;
  public static description = CommandBase.messages.getMessage('apex.coverage.execute.commandDescription');
  public static examples = [
    `$ sfdx acu-pack:apex:coverage:execute -u myOrgAlias
    Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics. The command block until all tests have completed.`,
    `$ sfdx acu-pack:apex:coverage:execute -u myOrgAlias -w 30
    Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics and waits up to 30 minutes for test completion.`,
    `$ sfdx acu-pack:apex:coverage:execute -u myOrgAlias -w 0
    Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics and returns immediately.`,
  ];

  protected static flagsConfig = {
    wait: flags.integer({
      char: 'w',
      description: CommandBase.messages.getMessage('apex.coverage.execute.waitDescription', [
        Execute.defaultJobStatusWaitMax,
      ]),
    }),
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  protected async runInternal(): Promise<void> {
    this.ux.log('Checking for pending tests...');

    let recordCount = 0;
    for await (recordCount of SfdxQuery.waitForApexTests(this.orgAlias)) {
      if (recordCount === 0) {
        break;
      }
    }
    if (recordCount !== 0) {
      this.raiseError(`${recordCount} Apex Test(s) are still executing - please try again later.`);
    }

    // Execute tests (with CodeCoverage) ?
    this.ux.log('Gathering Test ApexClasses...');
    const testClasses = await SfdxQuery.getApexTestClasses(this.orgAlias);
    if (!testClasses || testClasses.length === 0) {
      this.ux.log(`No Test ApexClasses exist for ${this.orgAlias}`);
      return;
    }

    // Enqueue the Apex tests
    let jobInfo = await SfdxTasks.enqueueApexTests(this.orgAlias, testClasses);
    if (!jobInfo) {
      this.raiseError('An unknown error occurred enqueuing Apex Tests');
    }

    this.ux.log(
      `${new Date().toJSON()} state: ${jobInfo.state} id: ${jobInfo.id} batch: ${
        jobInfo.batchId
      } isDone: ${jobInfo.isDone()}`
    );

    this.ux.log('Apex Tests Queued');

    // Are we waiting?
    if (this.flags.wait === 0) {
      return;
    }

    const waitCountMaxSeconds = (this.flags.wait || Execute.defaultJobStatusWaitMax) * 60;
    if (!jobInfo.isDone()) {
      if (waitCountMaxSeconds > 0) {
        this.ux.log(`Waiting (${waitCountMaxSeconds} seconds) for tests to complete...`);
      } else {
        this.ux.log('Waiting for tests to complete...');
      }

      for await (jobInfo of SfdxTasks.waitForJob(this.orgAlias, jobInfo, waitCountMaxSeconds)) {
        this.ux.log(
          `${new Date().toJSON()} state: ${jobInfo.state} id: ${jobInfo.id} batch: ${
            jobInfo.batchId
          } isDone: ${jobInfo.isDone()}`
        );
      }

      if (!jobInfo.isDone()) {
        this.raiseError(`Timeout while waiting for Apex Test Job to Complete:${JSON.stringify(jobInfo)}`);
        return;
      }
    }
    this.ux.log('All Apex Tests Started');
    const createdDate = jobInfo.createdDate || new Date().toJSON();
    for await (recordCount of SfdxQuery.waitForApexTests(this.orgAlias, waitCountMaxSeconds, createdDate)) {
      if (recordCount === 0) {
        break;
      }
      this.ux.log(`${recordCount} Apex Test(s) remaining.`);
    }

    if (recordCount !== 0) {
      this.raiseError(`${recordCount} Apex Test(s) are still executing - please try again later.`);
      return;
    }
    this.ux.log('Apex Tests Completed');
  }
}
