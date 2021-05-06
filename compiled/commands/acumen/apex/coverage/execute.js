"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const sfdx_query_1 = require("../../../../lib/sfdx-query");
const sfdx_tasks_1 = require("../../../../lib/sfdx-tasks");
class Execute extends command_base_1.CommandBase {
    async run() {
        var e_1, _a, e_2, _b, e_3, _c;
        try {
            this.ux.log(`Connecting to Org: ${this.orgAlias}(${this.orgId})`);
            this.ux.log('Checking for pending tests...');
            let recordCount = 0;
            try {
                for (var _d = tslib_1.__asyncValues(sfdx_query_1.SfdxQuery.waitForApexTests(this.orgAlias)), _e; _e = await _d.next(), !_e.done;) {
                    recordCount = _e.value;
                    if (recordCount === 0) {
                        break;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) await _a.call(_d);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (recordCount !== 0) {
                this.ux.log(`${recordCount} Apex Test(s) are still executing - please try again later.`);
                // Set the proper exit code to indicate violation/failure
                process.exitCode = 1;
                return;
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
                this.ux.log('An unknown error occurred enqueuing Apex Tests');
                process.exitCode = 1;
                return;
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
                try {
                    for (var _f = tslib_1.__asyncValues(sfdx_tasks_1.SfdxTasks.waitForJob(this.orgAlias, jobInfo, waitCountMaxSeconds)), _g; _g = await _f.next(), !_g.done;) {
                        jobInfo = _g.value;
                        this.ux.log(`${new Date().toJSON()} state: ${jobInfo.state} id: ${jobInfo.id} batch: ${jobInfo.batchId} isDone: ${jobInfo.isDone()}`);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) await _b.call(_f);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                if (!jobInfo.isDone()) {
                    this.ux.log('Timeout while waiting for Apex Test Job to Complete:');
                    this.ux.log(JSON.stringify(jobInfo));
                    process.exitCode = 1;
                    return;
                }
            }
            this.ux.log('All Apex Tests Started');
            const createdDate = jobInfo.createdDate || new Date().toJSON();
            try {
                for (var _h = tslib_1.__asyncValues(sfdx_query_1.SfdxQuery.waitForApexTests(this.orgAlias, waitCountMaxSeconds, createdDate)), _j; _j = await _h.next(), !_j.done;) {
                    recordCount = _j.value;
                    if (recordCount === 0) {
                        break;
                    }
                    this.ux.log(`${recordCount} Apex Test(s) remaining.`);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_c = _h.return)) await _c.call(_h);
                }
                finally { if (e_3) throw e_3.error; }
            }
            if (recordCount !== 0) {
                this.ux.log(`${recordCount} Apex Test(s) are still executing - please try again later.`);
                // Set the proper exit code to indicate violation/failure
                process.exitCode = 1;
                return;
            }
            this.ux.log('Apex Tests Completed');
        }
        catch (err) {
            throw err;
        }
        finally {
            this.ux.log('Done.');
        }
    }
}
exports.default = Execute;
Execute.defaultJobStatusWaitMax = -1;
Execute.description = command_base_1.CommandBase.messages.getMessage('apex.coverage.execute.commandDescription');
Execute.examples = [
    `$ sfdx acumen:apex:coverage:execute -u myOrgAlias
    Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics. The command block until all tests have completed.`,
    `$ sfdx acumen:apex:coverage:execute -u myOrgAlias -w 30
    Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics and waits up to 30 minutes for test completion.`,
    `$ sfdx acumen:apex:coverage:execute -u myOrgAlias -w 0
    Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics and returns immediately.`
];
Execute.flagsConfig = {
    wait: command_1.flags.integer({
        char: 'w',
        description: command_base_1.CommandBase.messages.getMessage('apex.coverage.execute.waitDescription', [Execute.defaultJobStatusWaitMax])
    })
};
// Comment this out if your command does not require an org username
Execute.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Execute.requiresProject = false;
//# sourceMappingURL=execute.js.map