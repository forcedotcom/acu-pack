"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const sfdx_query_1 = require("../../../../lib/sfdx-query");
const sfdx_client_1 = require("../../../../lib/sfdx-client");
const utils_1 = require("../../../../lib/utils");
class Clear extends command_base_1.CommandBase {
    async runInternal() {
        var e_1, _a, e_2, _b;
        this.ux.log('Checking for pending tests...');
        let recordCount = 0;
        try {
            for (var _c = tslib_1.__asyncValues(sfdx_query_1.SfdxQuery.waitForApexTests(this.orgAlias)), _d; _d = await _c.next(), !_d.done;) {
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
        // Clear Code Coverage Metadata
        const metaDataTypes = this.flags.metadatas
            ? this.flags.metadatas.split(',')
            : Clear.defaultMetadataTypes;
        let whereClause = '';
        if (this.flags.classortriggernames) {
            const names = [...this.flags.classortriggernames.split(',')].map(record => `'${record}'`).join(',');
            whereClause = ` where ApexClassorTrigger.Name in (${names})`;
        }
        this.ux.log('Clearing Code Coverage Data.');
        for (const metaDataType of metaDataTypes) {
            const query = `SELECT Id FROM ${metaDataType} ${whereClause}`;
            const records = await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, query, null, null, true);
            if (records && records.length > 0) {
                this.ux.log(`Clearing ${records.length} ${metaDataType} records...`);
                let counter = 0;
                const sfdxClient = new sfdx_client_1.SfdxClient(this.orgAlias);
                try {
                    for (var _e = (e_2 = void 0, tslib_1.__asyncValues(sfdxClient.do(utils_1.RestAction.DELETE, metaDataType, records, 'Id', sfdx_client_1.ApiKind.TOOLING, [sfdx_client_1.NO_CONTENT_CODE]))), _f; _f = await _e.next(), !_f.done;) {
                        const result = _f.value;
                        this.ux.log(`(${++counter}/${records.length}) Deleted id: ${result.getContent()}`);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) await _b.call(_e);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                this.ux.log('Cleared.');
            }
        }
    }
}
exports.default = Clear;
Clear.defaultJobStatusWaitMax = -1;
Clear.description = command_base_1.CommandBase.messages.getMessage('apex.coverage.clear.commandDescription');
// Don't include ApexCodeCoverage as these records appear to be auto-generate if they are deleted;
Clear.defaultMetadataTypes = ['ApexCodeCoverageAggregate'];
Clear.examples = [
    `$ sfdx acumen:apex:coverage:clear -u myOrgAlias
    Deletes the existing instances of ${Clear.defaultMetadataTypes.join(',')} from the specific Org.`
];
Clear.flagsConfig = {
    metadatas: command_1.flags.string({
        char: 'm',
        description: command_base_1.CommandBase.messages.getMessage('apex.coverage.clear.metadataFlagDescription', [Clear.defaultMetadataTypes.join(',')])
    }),
    classortriggernames: command_1.flags.string({
        char: 'n',
        description: command_base_1.CommandBase.messages.getMessage('apex.coverage.clear.classortriggernamesFlagDescription')
    })
};
// Comment this out if your command does not require an org username
Clear.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Clear.requiresProject = false;
//# sourceMappingURL=clear.js.map