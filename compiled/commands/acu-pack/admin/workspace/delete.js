"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const sfdx_query_1 = require("../../../../lib/sfdx-query");
const sfdx_tasks_1 = require("../../../../lib/sfdx-tasks");
const sfdx_client_1 = require("../../../../lib/sfdx-client");
const utils_1 = require("../../../../lib/utils");
class Delete extends command_base_1.CommandBase {
    async runInternal() {
        var e_1, _a;
        const usernames = [];
        if (this.flags.userlist) {
            for (const username of this.flags.userlist.split(',')) {
                usernames.push(username.trim());
            }
        }
        else {
            const orgInfo = await sfdx_tasks_1.SfdxTasks.getOrgInfo(this.orgAlias);
            usernames.push(orgInfo.username);
        }
        if (!usernames || usernames.length === 0) {
            this.raiseError('No usernames specified.');
        }
        this.ux.log('Deleteing Workspaces for users:');
        this.ux.log(`\t${usernames.join(',')}`);
        // https://help.salesforce.com/articleView?id=000332898&type=1&mode=1
        const sfdxClient = new sfdx_client_1.SfdxClient(this.orgAlias);
        for (const username of usernames) {
            const query = `SELECT Id FROM IDEWorkspace WHERE CreatedById IN (SELECT Id FROM User WHERE Username = '${username}')`;
            const workspaceRecords = await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, query, null, null, true);
            if (!workspaceRecords || workspaceRecords.length === 0) {
                this.ux.log(`No workspaces found for user: '${username}'.`);
                continue;
            }
            try {
                try {
                    for (var _b = (e_1 = void 0, tslib_1.__asyncValues(sfdxClient.do(utils_1.RestAction.DELETE, 'IDEWorkspace', workspaceRecords, 'Id', sfdx_client_1.ApiKind.TOOLING, [sfdx_client_1.NO_CONTENT_CODE]))), _c; _c = await _b.next(), !_c.done;) {
                        const result = _c.value;
                        this.ux.log(`Deleted Workspace(${result.getContent()}) for user: '${username}'.`);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            catch (err) {
                this.ux.log(`Error Deleting Workspace(s) (${JSON.stringify(workspaceRecords)}) for user: '${username}'.`);
            }
        }
    }
}
exports.default = Delete;
Delete.description = command_base_1.CommandBase.messages.getMessage('admin.workspace.delete.commandDescription');
Delete.examples = [
    `$ sfdx admin:workspace:delete -u myOrgAlias
    Deletes the Developer Console IDEWorkspace objects for the specified target username (-u).`,
    `$ sfdx admin:workspace:delete -u myOrgAlias -l 'user1@sf.com, user2@sf.com, user3@sf.com'
    Deletes the Developer Console IDEWorkspace objects for the specified list of users (-l).`
];
Delete.flagsConfig = {
    userlist: command_1.flags.string({
        char: 'l',
        description: command_base_1.CommandBase.messages.getMessage('admin.workspace.delete.userListFlagDescription')
    })
};
// Comment this out if your command does not require an org username
Delete.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Delete.requiresProject = false;
//# sourceMappingURL=delete.js.map