"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const sfdx_query_1 = require("../../../../lib/sfdx-query");
const sfdx_client_1 = require("../../../../lib/sfdx-client");
const utils_1 = require("../../../../lib/utils");
class Clear extends command_base_1.CommandBase {
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
        // Clear Code Coverage Metadata
        const metaDataTypes = this.flags.metadatas ? this.flags.metadatas.split(',') : Clear.defaultMetadataTypes;
        let whereClause = '';
        if (this.flags.classortriggernames) {
            const names = [...this.flags.classortriggernames.split(',')].map((record) => `'${record}'`).join(',');
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
                for await (const result of sfdxClient.do(utils_1.RestAction.DELETE, metaDataType, records, 'Id', sfdx_client_1.ApiKind.TOOLING, [
                    sfdx_client_1.NO_CONTENT_CODE,
                ])) {
                    this.ux.log(`(${++counter}/${records.length}) Deleted id: ${result.getContent()}`);
                }
                this.ux.log('Cleared.');
            }
        }
    }
}
Clear.defaultJobStatusWaitMax = -1;
Clear.description = command_base_1.CommandBase.messages.getMessage('apex.coverage.clear.commandDescription');
// Don't include ApexCodeCoverage as these records appear to be auto-generate if they are deleted;
Clear.defaultMetadataTypes = ['ApexCodeCoverageAggregate'];
Clear.examples = [
    `$ sfdx acu-pack:apex:coverage:clear -u myOrgAlias
    Deletes the existing instances of ${Clear.defaultMetadataTypes.join(',')} from the specific Org.`,
];
Clear.flagsConfig = {
    metadatas: command_1.flags.string({
        char: 'm',
        description: command_base_1.CommandBase.messages.getMessage('apex.coverage.clear.metadataFlagDescription', [
            Clear.defaultMetadataTypes.join(','),
        ]),
    }),
    classortriggernames: command_1.flags.string({
        char: 'n',
        description: command_base_1.CommandBase.messages.getMessage('apex.coverage.clear.classortriggernamesFlagDescription'),
    }),
};
// Comment this out if your command does not require an org username
Clear.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Clear.requiresProject = false;
exports.default = Clear;
//# sourceMappingURL=clear.js.map