"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const sfdx_query_1 = require("../../../../lib/sfdx-query");
const sfdx_tasks_1 = require("../../../../lib/sfdx-tasks");
class Coverage extends command_base_1.CommandBase {
    async run() {
        var e_1, _a, e_2, _b, e_3, _c;
        const username = this.flags.targetusername;
        const orgId = this.org.getOrgId();
        try {
            this.ux.log('Checking for pending tests...');
            let recordCount = 0;
            try {
                for (var _d = tslib_1.__asyncValues(sfdx_query_1.SfdxQuery.waitForApexTestsAsync(username)), _e; _e = await _d.next(), !_e.done;) {
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
            this.ux.log(`Gathering Test ApexClasses from Org: ${username}(${orgId})`);
            const testClasses = await sfdx_query_1.SfdxQuery.getApexTestClassesAsync(username);
            if (testClasses.length === 0) {
                this.ux.log(`No Test ApexClasses exist for ${username}`);
                return;
            }
            // Enqueue the Apex tests
            let jobInfo = await sfdx_tasks_1.SfdxTasks.enqueueApexTestsAsync(username, testClasses);
            if (!jobInfo) {
                this.ux.log('An unknown error occurred enqueuing Apex Tests');
                process.exitCode = 1;
                return;
            }
            const waitCountMaxSeconds = (this.flags.wait || Coverage.defaultJobStatusWaitMax) * 60;
            if (!jobInfo.isDone()) {
                try {
                    for (var _f = tslib_1.__asyncValues(sfdx_tasks_1.SfdxTasks.waitForJobAsync(username, jobInfo, waitCountMaxSeconds)), _g; _g = await _f.next(), !_g.done;) {
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
            this.ux.log('Apex Tests Started');
            if (waitCountMaxSeconds != 0) {
                const createdDate = jobInfo.createdDate || new Date().toJSON();
                try {
                    for (var _h = tslib_1.__asyncValues(sfdx_query_1.SfdxQuery.waitForApexTestsAsync(username, waitCountMaxSeconds, createdDate)), _j; _j = await _h.next(), !_j.done;) {
                        recordCount = _j.value;
                        if (recordCount === 0) {
                            break;
                        }
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
        }
        catch (err) {
            throw err;
        }
        finally {
            this.ux.log('Done.');
        }
    }
}
exports.default = Coverage;
Coverage.defaultJobStatusWaitMax = 0;
Coverage.description = command_base_1.CommandBase.messages.getMessage('apex.coverage.execute.commandDescription');
Coverage.examples = [
    `$ sfdx acumen:apex:coverage:execute -u myOrgAlias
    Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics.`,
    `$ sfdx acumen:apex:coverage:execute -u myOrgAlias -w 30
    Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics and waits up to 30 minutes for test completion.`
];
Coverage.flagsConfig = {
    wait: command_1.flags.integer({
        char: 'w',
        description: command_base_1.CommandBase.messages.getMessage('apex.coverage.execute.waitDescription')
    })
};
// Comment this out if your command does not require an org username
Coverage.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Coverage.requiresProject = false;
//# sourceMappingURL=execute.js.map