import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
import { SfdxQuery } from '../../../../lib/sfdx-query';
import { Office } from '../../../../lib/office';

export default class Report extends CommandBase {
  public static defaultJobStatusWaitMax = -1;
  public static description = CommandBase.messages.getMessage('apex.coverage.report.commandDescription');
  public static defaultReportPath = 'CodeCoverageReport-{ORG}.xlsx';
  // public static testLevels = ['RunLocalTests', 'RunAllTestsInOrg', 'RunSpecifiedTests'];
  public static examples = [
    `$ sfdx acumen:apex:coverage:report -u myOrgAlias -r myCodeCoverageReport.xlsx
    Pulls the Code Coverage metrics from myOrgAlias and generates a CodeCoverageReport-myOrgAlias.xlsx report.`
  ];

  protected static flagsConfig = {
    report: flags.string({
      char: 'r',
      description: CommandBase.messages.getMessage('apex.coverage.report.reportFlagDescription', [Report.defaultReportPath])
    }),
    wait: flags.integer({
      char: 'w',
      description: CommandBase.messages.getMessage('apex.coverage.report.waitDescription', [Report.defaultJobStatusWaitMax])
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

      const waitCountMaxSeconds = (this.flags.wait || Report.defaultJobStatusWaitMax) * 60;
      let recordCount = 0;
      for await (recordCount of SfdxQuery.waitForApexTests(this.orgAlias, waitCountMaxSeconds)) {
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

      // Get Code Coverage Report
      this.ux.log('Getting Code Coverage Report Data.');

      const codeCoverage = await SfdxQuery.getCodeCoverage(this.orgAlias);
      codeCoverage.calculateCodeCoverage();
      const workbookMap = new Map<string, string[][]>();

      // Code Coverage
      workbookMap.set(`${this.orgAlias} Code Coverage`, [
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
          `${codeCoverageItem.coveredLines.length}`,
          `${codeCoverageItem.uncoveredLines.length}`,
          `${codeCoverageItem.getCodeCoveragePercent().toFixed(3)}`
        ]);
      }
      workbookMap.set('Code Coverage Details', sheetData);

      // Check Apex Test Failures
      const today = `${new Date().toJSON().slice(0, 10)}T00:00:00.000Z`;
      const query = `SELECT ApexClass.Name, AsyncApexJobId, ApexTestRunResultId, Message, MethodName, StackTrace, TestTimestamp FROM ApexTestResult WHERE SystemModstamp >= ${today} AND Outcome='Fail' ORDER BY ApexClass.Name, MethodName, SystemModstamp ASC`;
      const records = await SfdxQuery.doSoqlQuery(this.orgAlias, query);

      sheetData = [['Class Name', 'Method Name', 'Error Message', 'Stack Trace', 'AsyncApexJobId', 'ApexTestRunResultId', 'TestTimestamp']];
      for (const record of records) {
        sheetData.push([
          record.ApexClass.Name,
          record.MethodName,
          record.Message,
          record.StackTrace,
          record.AsyncApexJobId,
          record.ApexTestRunResultId,
          record.TestTimestamp
        ]);
      }
      workbookMap.set('Apex Test Failures', sheetData);

      const reportPath = this.flags.report || Report.defaultReportPath.replace(/\{ORG\}/, this.orgAlias);
      Office.writeXlxsWorkbook(workbookMap, reportPath);
      this.ux.log(`${reportPath} written.`);

    } catch (err) {
      throw err;
    } finally {
      this.ux.log('Done.');
    }
  }
}
