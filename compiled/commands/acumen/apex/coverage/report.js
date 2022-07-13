"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const sfdx_query_1 = require("../../../../lib/sfdx-query");
const office_1 = require("../../../../lib/office");
class Report extends command_base_1.CommandBase {
    async runInternal() {
        var e_1, _a;
        var _b;
        this.ux.log('Checking for pending tests...');
        const waitCountMaxSeconds = (this.flags.wait || Report.defaultJobStatusWaitMax) * 60;
        let recordCount = 0;
        try {
            for (var _c = tslib_1.__asyncValues(sfdx_query_1.SfdxQuery.waitForApexTests(this.orgAlias, waitCountMaxSeconds)), _d; _d = await _c.next(), !_d.done;) {
                recordCount = _d.value;
                if (recordCount === 0) {
                    break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) await _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (recordCount !== 0) {
            this.raiseError(`${recordCount} Apex Test(s) are still executing - please try again later.`);
        }
        // Get Code Coverage Report
        this.ux.log('Getting Code Coverage Report Data.');
        const codeCoverage = await sfdx_query_1.SfdxQuery.getCodeCoverage(this.orgAlias);
        codeCoverage.calculateCodeCoverage();
        const workbookMap = new Map();
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
            ]
        ]);
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
        const records = await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, query);
        sheetData = [['Class Name', 'Method Name', 'Error Message', 'Stack Trace', 'AsyncApexJobId', 'ApexTestRunResultId', 'TestTimestamp']];
        for (const record of records) {
            sheetData.push([
                (_b = record.ApexClass) === null || _b === void 0 ? void 0 : _b.Name,
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
        office_1.Office.writeXlxsWorkbook(workbookMap, reportPath);
        this.ux.log(`${reportPath} written.`);
    }
}
exports.default = Report;
Report.defaultJobStatusWaitMax = -1;
Report.description = command_base_1.CommandBase.messages.getMessage('apex.coverage.report.commandDescription');
Report.defaultReportPath = 'CodeCoverageReport-{ORG}.xlsx';
// public static testLevels = ['RunLocalTests', 'RunAllTestsInOrg', 'RunSpecifiedTests'];
Report.examples = [
    `$ sfdx acumen:apex:coverage:report -u myOrgAlias -r myCodeCoverageReport.xlsx
    Pulls the Code Coverage metrics from myOrgAlias and generates a CodeCoverageReport-myOrgAlias.xlsx report.`
];
Report.flagsConfig = {
    report: command_1.flags.string({
        char: 'r',
        description: command_base_1.CommandBase.messages.getMessage('apex.coverage.report.reportFlagDescription', [Report.defaultReportPath])
    }),
    wait: command_1.flags.integer({
        char: 'w',
        description: command_base_1.CommandBase.messages.getMessage('apex.coverage.report.waitDescription', [Report.defaultJobStatusWaitMax])
    })
};
// Comment this out if your command does not require an org username
Report.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Report.requiresProject = false;
//# sourceMappingURL=report.js.map