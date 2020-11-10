"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../lib/command-base");
const sfdx_query_1 = require("../../../lib/sfdx-query");
const sfdx_tasks_1 = require("../../../lib/sfdx-tasks");
const office_1 = require("../../../lib/office");
class Coverage extends command_base_1.CommandBase {
    async run() {
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
                const testClasses = await sfdx_query_1.SfdxQuery.getApexTestClassesAsync(username);
                if (testClasses.length === 0) {
                    this.ux.log(`No Test ApexClasses exist for ${username}`);
                    return;
                }
                if (!await this.enqueueApexTestsAsync(username, testClasses.splice(0, 10), waitCountMaxSeconds)) {
                    return;
                }
                this.ux.log('Apex Tests Completed');
            }
            // Get Code Coverage Report
            this.ux.log('Getting Code Coverage Report Data.');
            const codeCoverage = await sfdx_query_1.SfdxQuery.getCodeCoverageAsync(username);
            codeCoverage.calculateCodeCoverage();
            const workbookMap = new Map();
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
                ]
            ]);
            const sheetData = [['Class Name', 'Covered Lines', 'Uncovered Lines', '% Covered']];
            for (const codeCoverageItem of codeCoverage.codeCoverage) {
                sheetData.push([
                    codeCoverageItem.name,
                    `${codeCoverageItem.coveredLines.join(',')}`,
                    `${codeCoverageItem.uncoveredLines.join(',')}`,
                    `${codeCoverageItem.getCodeCoveragePercent().toFixed(3)}`
                ]);
            }
            workbookMap.set('Code Coverage Details', sheetData);
            const reportPath = this.flags.report || Coverage.defaultReportPath.replace(/\{ORG\}/, username);
            office_1.Office.writeXlxsWorkbook(workbookMap, reportPath);
            this.ux.log(`${reportPath} written.`);
        }
        catch (err) {
            throw err;
        }
        finally {
            this.ux.log('Done.');
        }
    }
    async enqueueApexTestsAsync(username, testClasses, waitCountMaxSeconds) {
        var e_1, _a;
        // Enqueue the Apex tests
        let jobInfo = await sfdx_tasks_1.SfdxTasks.enqueueApexTestsAsync(username, testClasses);
        if (!jobInfo) {
            return false;
        }
        if (!jobInfo.isDone()) {
            try {
                for (var _b = tslib_1.__asyncValues(sfdx_tasks_1.SfdxTasks.waitForJobAsync(username, jobInfo, waitCountMaxSeconds)), _c; _c = await _b.next(), !_c.done;) {
                    jobInfo = _c.value;
                    this.ux.log(`${new Date().toJSON()} state: ${jobInfo.state} id: ${jobInfo.id} batch: ${jobInfo.batchId} isDone: ${jobInfo.isDone()}`);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (!jobInfo.isDone()) {
                this.ux.log('Timeout while waiting for Apex Test Job to Complete:');
                this.ux.log(JSON.stringify(jobInfo));
                return false;
            }
        }
        this.ux.log('Apex Tests Started');
        return await this.waitForApexTestsAsync(username, waitCountMaxSeconds, jobInfo.createdDate || new Date().toJSON());
    }
    async waitForApexTestsAsync(username, waitCountMaxSeconds, createdDate = new Date().toJSON()) {
        var e_2, _a;
        const query = `SELECT ApexClassId, ShouldSkipCodeCoverage, Status, CreatedDate FROM ApexTestQueueItem WHERE CreatedDate > ${createdDate} AND Status NOT IN ('Completed', 'Failed', 'Aborted')`;
        const targetCount = 0;
        let recordCount = 0;
        try {
            for (var _b = tslib_1.__asyncValues(sfdx_query_1.SfdxQuery.waitForRecordCount(username, query, targetCount, waitCountMaxSeconds)), _c; _c = await _b.next(), !_c.done;) {
                recordCount = _c.value;
                if (recordCount !== targetCount) {
                    this.ux.log(`${new Date().toJSON()} - ${recordCount} Tests Remaining`);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (recordCount !== targetCount) {
            this.ux.log(`Apex Tests Still Pending - wait (${waitCountMaxSeconds} seconds) expired, try again later.`);
            return false;
        }
        return true;
    }
}
exports.default = Coverage;
Coverage.defaultJobStatusWaitMax = -1;
Coverage.description = command_base_1.CommandBase.messages.getMessage('apex.coverage.commandDescription');
Coverage.defaultReportPath = 'CodeCoverageReport-{ORG}.xlsx';
// public static testLevels = ['RunLocalTests', 'RunAllTestsInOrg', 'RunSpecifiedTests'];
Coverage.examples = [
    `$ sfdx acumen:apex:coverage -u myOrgAlias -r myCodeCoverageReport.xlsx
    Runs Apex Tests in myOrgAlias and generates a myCodeCoverageReport.xlsx coverage report.`,
    `$ sfdx acumen:apex:coverage -u myOrgAlias -r myCodeCoverageReport.xlsx -s true
    Skips running Apex Tests in myOrgAlias and generates a myCodeCoverageReport.xlsx coverage report.`
];
Coverage.flagsConfig = {
    report: command_1.flags.string({
        char: 'r',
        description: command_base_1.CommandBase.messages.getMessage('apex.coverage.reportFlagDescription', [Coverage.defaultReportPath])
    }),
    skiptests: command_1.flags.boolean({
        char: 's',
        description: command_base_1.CommandBase.messages.getMessage('apex.coverage.skipTestsDescription')
    }),
    wait: command_1.flags.integer({
        char: 'w',
        description: command_base_1.CommandBase.messages.getMessage('apex.coverage.waitDescription')
    })
};
// Comment this out if your command does not require an org username
Coverage.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Coverage.requiresProject = false;
//# sourceMappingURL=coverage.js.map