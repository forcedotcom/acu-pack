import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
import { SfdxQuery, SfdxEntity } from '../../../lib/sfdx-query';
import { SfdxTasks } from '../../../lib/sfdx-tasks';
import { Office } from '../../../lib/office';

export default class Coverage extends CommandBase {
  public static defaultJobStatusWaitMax = -1;
  public static description = CommandBase.messages.getMessage('apex.coverage.commandDescription');
  public static defaultReportPath = 'CodeCoverageReport-{ORG}.xlsx';
  // public static testLevels = ['RunLocalTests', 'RunAllTestsInOrg', 'RunSpecifiedTests'];
  public static examples = [
    `$ sfdx acumen:apex:coverage -u myOrgAlias -r myCodeCoverageReport.xlsx
    Runs Apex Tests in myOrgAlias and generates a myCodeCoverageReport.xlsx coverage report.`,
    `$ sfdx acumen:apex:coverage -u myOrgAlias -r myCodeCoverageReport.xlsx -s true
    Skips running Apex Tests in myOrgAlias and generates a myCodeCoverageReport.xlsx coverage report.`
  ];

  protected static flagsConfig = {
    report: flags.string({
      char: 'r',
      description: CommandBase.messages.getMessage('apex.coverage.reportFlagDescription', [Coverage.defaultReportPath])
    }),
    skiptests: flags.boolean({
      char: 's',
      description: CommandBase.messages.getMessage('apex.coverage.skipTestsDescription')
    }),
    wait: flags.integer({
      char: 'w',
      description: CommandBase.messages.getMessage('apex.coverage.waitDescription')
    })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  private testFailures = new Map<string, any>();

  public async run(): Promise<void> {
    const username = this.flags.targetusername;
    const orgId = this.org.getOrgId();
    try {
      this.ux.log('Checking for pending tests...');

      const waitCountMaxSeconds = (this.flags.wait || Coverage.defaultJobStatusWaitMax) * 60;
      if (!(await this.waitForApexTestsAsync(username, waitCountMaxSeconds))) {
        return;
      }

      // Execute tests (with CodeCoverage) ?
      if (!this.flags.skiptests) {
        this.ux.log(`Gathering Test ApexClasses from Org: ${username}(${orgId})`);
        const testClasses = await SfdxQuery.getApexTestClassesAsync(username);
        if (testClasses.length === 0) {
          this.ux.log(`No Test ApexClasses exist for ${username}`);
          return;
        }

        if (!await this.enqueueApexTestsAsync(username, testClasses, waitCountMaxSeconds)) {
          return;
        }
        this.ux.log('Apex Tests Completed');
      }

      // Get Code Coverage Report
      this.ux.log('Getting Code Coverage Report Data.');

      const codeCoverage = await SfdxQuery.getCodeCoverageAsync(username);
      codeCoverage.calculateCodeCoverage();
      const workbookMap = new Map<string, string[][]>();

      // Code Coverage
      workbookMap.set(`${username} Code Coverage`, [
        ['Total Classes',
          'Total Lines',
          'Total Covered',
          'Total Uncovered',
          'Total % Covered'
        ],
        [`${codeCoverage.codeCoverage.length}`,
        `${codeCoverage.totalCoveredLines + codeCoverage.totalUncoveredLines}`,
        `${codeCoverage.totalCoveredLines}`,
        `${codeCoverage.totalUncoveredLines}`,
        `${codeCoverage.codeCoveragePercent.toFixed(3)}`
        ]]);

      // Code Coverage Details
      let sheetData = [['Class Name', 'Covered Lines', 'Uncovered Lines', '% Covered']];
      for (const codeCoverageItem of codeCoverage.codeCoverage) {
        sheetData.push([
          codeCoverageItem.name,
          `${codeCoverageItem.coveredLines.join(',')}`,
          `${codeCoverageItem.uncoveredLines.join(',')}`,
          `${codeCoverageItem.getCodeCoveragePercent().toFixed(3)}`
        ]);
      }
      workbookMap.set('Code Coverage Details', sheetData);

      // Apex Test Failures
      if (this.testFailures.size > 0) {
        sheetData = [['Class Name', 'Method Name', 'Error Message', 'Stack Trace', 'AsyncApexJobId', 'ApexTestRunResultId', 'TestTimestamp']];
        for (const [name, apexFailure] of this.testFailures) {
          const parts = name.split('.');
          sheetData.push([
            parts[0],
            parts[1],
            apexFailure.message,
            apexFailure.stackTrace,
            apexFailure.asyncApexJobId,
            apexFailure.apexTestRunResultId,
            apexFailure.testTimestamp
          ]);
        }
        workbookMap.set('Apex Test Failures', sheetData);
      }

      const reportPath = this.flags.report || Coverage.defaultReportPath.replace(/\{ORG\}/, username);
      Office.writeXlxsWorkbook(workbookMap, reportPath);
      this.ux.log(`${reportPath} written.`);

    } catch (err) {
      throw err;
    } finally {
      this.ux.log('Done.');
    }
  }

  private async enqueueApexTestsAsync(username: string, testClasses: SfdxEntity[], waitCountMaxSeconds: number): Promise<boolean> {
    // Enqueue the Apex tests
    let jobInfo = await SfdxTasks.enqueueApexTestsAsync(username, testClasses);
    if (!jobInfo) {
      return false;
    }

    if (!jobInfo.isDone()) {
      for await (jobInfo of SfdxTasks.waitForJobAsync(username, jobInfo, waitCountMaxSeconds)) {
        this.ux.log(`${new Date().toJSON()} state: ${jobInfo.state} id: ${jobInfo.id} batch: ${jobInfo.batchId} isDone: ${jobInfo.isDone()}`);
      }

      if (!jobInfo.isDone()) {
        this.ux.log('Timeout while waiting for Apex Test Job to Complete:');
        this.ux.log(JSON.stringify(jobInfo));
        return false;
      }
    }
    this.ux.log('Apex Tests Started');
    const createdDate = jobInfo.createdDate || new Date().toJSON();
    if (!await this.waitForApexTestsAsync(username, waitCountMaxSeconds, createdDate)) {
      return false;
    }

    const query = `SELECT ApexClass.Name, AsyncApexJobId, ApexTestRunResultId, Message, MethodName, StackTrace, TestTimestamp FROM ApexTestResult WHERE SystemModstamp >= ${createdDate} AND Outcome='Fail' ORDER BY ApexClass.Name, MethodName, SystemModstamp ASC`;
    const records = await SfdxQuery.doSoqlQueryAsync(username, query);

    for (const record of records) {
      this.testFailures.set(
        `${record.ApexClass.Name}.${record.MethodName}`, {
        message: record.Message,
        stackTrace: record.StackTrace,
        asyncApexJobId: record.AsyncApexJobId,
        apexTestRunResultId: record.ApexTestRunResultId,
        testTimestamp: record.TestTimestamp
      });
    }

    return true;
  }

  private async waitForApexTestsAsync(username: string, waitCountMaxSeconds: number, createdDate: string = new Date().toJSON()): Promise<boolean> {
    const query = `SELECT ApexClassId, ShouldSkipCodeCoverage, Status, CreatedDate FROM ApexTestQueueItem WHERE CreatedDate > ${createdDate} AND Status NOT IN ('Completed', 'Failed', 'Aborted')`;
    const targetCount = 0;

    let recordCount = 0;
    // Check every 30 seconds or waitCountMaxSeconds so we don't waste a bunch of queries
    const interval = waitCountMaxSeconds >= 30 ? 30000 : waitCountMaxSeconds;
    for await (recordCount of SfdxQuery.waitForRecordCount(username, query, targetCount, waitCountMaxSeconds, interval)) {
      if (recordCount !== targetCount) {
        this.ux.log(`${new Date().toJSON()} - ${recordCount} Tests Remaining`);
      }
    }

    if (recordCount !== targetCount) {
      this.ux.log(`Apex Tests Still Pending - wait (${waitCountMaxSeconds} seconds) expired, try again later.`);
      return false;
    }

    return true;
  }
}
