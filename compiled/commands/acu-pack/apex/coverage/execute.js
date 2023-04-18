"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const sfdx_query_1 = require("../../../../lib/sfdx-query");
const sfdx_tasks_1 = require("../../../../lib/sfdx-tasks");
class Execute extends command_base_1.CommandBase {
    async runInternal() {
        this.ux.log('Checking for pending tests...');
        let recordCount = 0;
        for await (recordCount of sfdx_query_1.SfdxQuery.waitForApexTests(this.orgAlias)) {
            if (recordCount === 0) {
                break;
            }
        }
        if (recordCount !== 0) {
            this.raiseError(`${recordCount} Apex Test(s) are still executing - please try again later.`);
        }
        // Execute tests (with CodeCoverage) ?
        this.ux.log('Gathering Test ApexClasses...');
        const testClasses = await sfdx_query_1.SfdxQuery.getApexTestClasses(this.orgAlias);
        if (!testClasses || testClasses.length === 0) {
            this.ux.log(`No Test ApexClasses exist for ${this.orgAlias}`);
            return;
        }
        // Enqueue the Apex tests
        let jobInfo = await sfdx_tasks_1.SfdxTasks.enqueueApexTests(this.orgAlias, testClasses);
        if (!jobInfo) {
            this.raiseError('An unknown error occurred enqueuing Apex Tests');
        }
        this.ux.log(`${new Date().toJSON()} state: ${jobInfo.state} id: ${jobInfo.id} batch: ${jobInfo.batchId} isDone: ${jobInfo.isDone()}`);
        this.ux.log('Apex Tests Queued');
        // Are we waiting?
        if (this.flags.wait === 0) {
            return;
        }
        const waitCountMaxSeconds = (this.flags.wait || Execute.defaultJobStatusWaitMax) * 60;
        if (!jobInfo.isDone()) {
            if (waitCountMaxSeconds > 0) {
                this.ux.log(`Waiting (${waitCountMaxSeconds} seconds) for tests to complete...`);
            }
            else {
                this.ux.log('Waiting for tests to complete...');
            }
            for await (jobInfo of sfdx_tasks_1.SfdxTasks.waitForJob(this.orgAlias, jobInfo, waitCountMaxSeconds)) {
                this.ux.log(`${new Date().toJSON()} state: ${jobInfo.state} id: ${jobInfo.id} batch: ${jobInfo.batchId} isDone: ${jobInfo.isDone()}`);
            }
            if (!jobInfo.isDone()) {
                this.raiseError(`Timeout while waiting for Apex Test Job to Complete:${JSON.stringify(jobInfo)}`);
                return;
            }
        }
        this.ux.log('All Apex Tests Started');
        const createdDate = jobInfo.createdDate || new Date().toJSON();
        for await (recordCount of sfdx_query_1.SfdxQuery.waitForApexTests(this.orgAlias, waitCountMaxSeconds, createdDate)) {
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
exports.default = Execute;
Execute.defaultJobStatusWaitMax = -1;
Execute.description = command_base_1.CommandBase.messages.getMessage('apex.coverage.execute.commandDescription');
Execute.examples = [
    `$ sfdx acu-pack:apex:coverage:execute -u myOrgAlias
    Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics. The command block until all tests have completed.`,
    `$ sfdx acu-pack:apex:coverage:execute -u myOrgAlias -w 30
    Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics and waits up to 30 minutes for test completion.`,
    `$ sfdx acu-pack:apex:coverage:execute -u myOrgAlias -w 0
    Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics and returns immediately.`,
];
Execute.flagsConfig = {
    wait: command_1.flags.integer({
        char: 'w',
        description: command_base_1.CommandBase.messages.getMessage('apex.coverage.execute.waitDescription', [
            Execute.defaultJobStatusWaitMax,
        ]),
    }),
};
// Comment this out if your command does not require an org username
Execute.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Execute.requiresProject = false;
//# sourceMappingURL=execute.js.map