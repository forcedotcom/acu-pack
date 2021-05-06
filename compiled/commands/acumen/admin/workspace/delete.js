"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const sfdx_query_1 = require("../../../../lib/sfdx-query");
const sfdx_tasks_1 = require("../../../../lib/sfdx-tasks");
const sfdx_client_1 = require("../../../../lib/sfdx-client");
class Delete extends command_base_1.CommandBase {
    async run() {
        var e_1, _a;
        let hasErrors = false;
        try {
            this.ux.log(`Connecting to Org: ${this.orgAlias}(${this.orgId})`);
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
                this.ux.log('No usernames specified.');
                // Set the proper exit code to indicate violation/failure
                process.exitCode = 1;
                return;
            }
            this.ux.log('Deleteing Workspaces for users:');
            this.ux.log(`\t${usernames.join(',')}`);
            // https://help.salesforce.com/articleView?id=000332898&type=1&mode=1
            const sfdxClient = new sfdx_client_1.SfdxClient(this.orgAlias);
            for (const username of usernames) {
                const query = `SELECT Id FROM IDEWorkspace WHERE CreatedById IN (SELECT Id FROM User WHERE Username = '${username}')`;
                const workspaceIds = await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, query, null, null, true);
                if (!workspaceIds || workspaceIds.length === 0) {
                    this.ux.log(`No workspaces found for user: '${username}'.`);
                    continue;
                }
                try {
                    try {
                        for (var _b = tslib_1.__asyncValues(sfdxClient.do(sfdx_client_1.RestAction.DELETE, 'IDEWorkspace', workspaceIds, 'Id', sfdx_client_1.ApiKind.TOOLING, [sfdx_client_1.NO_CONTENT_CODE])), _c; _c = await _b.next(), !_c.done;) {
                            const result = _c.value;
                            this.ux.log(`Deleted Workspace(${result}) for user: '${username}'.`);
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
                    this.ux.log(`Error Deleting Workspace(s) (${workspaceIds}) for user: '${username}'.`);
                    hasErrors = true;
                }
            }
        }
        catch (err) {
            process.exitCode = 1;
            throw err;
        }
        finally {
            if (hasErrors) {
                process.exitCode = 1;
            }
            this.ux.log('Done.');
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