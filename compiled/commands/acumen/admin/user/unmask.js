"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const sfdx_query_1 = require("../../../../lib/sfdx-query");
const sfdx_client_1 = require("../../../../lib/sfdx-client");
const utils_1 = require("../../../../lib/utils");
class Unmask extends command_base_1.CommandBase {
    async run() {
        var e_1, _a;
        const username = this.flags.targetusername;
        const orgId = this.org.getOrgId();
        let hasErrors = false;
        try {
            this.ux.log(`Connecting to Org: ${username}(${orgId})`);
            this.ux.log('Unmasking users...');
            let usernames;
            if (this.flags.userlist) {
                usernames = this.flags.userlist.split(',');
            }
            else if (this.flags.userfile) {
                usernames = [];
                try {
                    for (var _b = tslib_1.__asyncValues(utils_1.default.readFileAsync(this.flags.userFile)), _c; _c = await _b.next(), !_c.done;) {
                        const un = _c.value;
                        usernames.push(un);
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
            if (!usernames || usernames.length === 0) {
                this.ux.log('No usernames specified.');
                // Set the proper exit code to indicate violation/failure
                process.exitCode = 1;
                return;
            }
            this.ux.log('Retrieving Users...');
            const query = `SELECT Id, username, IsActive, Email FROM User WHERE IsActive=true AND Title = 'Contractor' AND Email LIKE '%.invalid' AND Username ${sfdx_query_1.SfdxQuery.getInClause(usernames)}`;
            const users = await sfdx_query_1.SfdxQuery.doSoqlQueryAsync(username, query);
            const patchObj = {
                allOrNone: false,
                records: []
            };
            for (const user of users) {
                user.newEmail = utils_1.default.unmaskEmail(user.Email);
                patchObj.records.push({
                    attributes: { type: 'User' },
                    id: user.Id,
                    Email: user.newEmail
                });
            }
            if (patchObj.records.length !== 0) {
                this.ux.log('Unmasking Users...');
                const sfdxClient = new sfdx_client_1.SfdxClient(username);
                const results = await sfdxClient.doComposite(sfdx_client_1.RestAction.PATCH, patchObj);
                for (const result of results) {
                    for (const user of users) {
                        if (user.Id === result.id) {
                            if (result.success) {
                                this.ux.log(`${user.Username} ${user.Email} => ${user.newEmail}`);
                            }
                            else {
                                hasErrors = true;
                                this.ux.log(`${user.Username} ${user.Email}`);
                                for (const error of result.errors) {
                                    this.ux.log(`\t=> ${error}`);
                                }
                            }
                            break;
                        }
                    }
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
exports.default = Unmask;
Unmask.description = command_base_1.CommandBase.messages.getMessage('admin.user.unmask.commandDescription');
Unmask.examples = [
    `$ sfdx admin:user:unmask -u myOrgAlias -l 'user1@sf.com, user2@sf.com, user3@sf.com'
    Removes the .invalid extension from the email address associated to the list of specified users in the specified Org.`,
    `$ sfdx admin:user:unmask -u myOrgAlias -f qa-users.txt
    Removes the .invalid extension from the email address associated to the list of users in the specified file in the specified Org.`
];
Unmask.flagsConfig = {
    userlist: command_1.flags.string({
        char: 'l',
        description: command_base_1.CommandBase.messages.getMessage('admin.user.unmask.userListFlagDescription')
    }),
    userfile: command_1.flags.string({
        char: 'f',
        description: command_base_1.CommandBase.messages.getMessage('admin.user.unmask.userFileFlagDescription')
    })
};
// Comment this out if your command does not require an org username
Unmask.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Unmask.requiresProject = false;
//# sourceMappingURL=unmask.js.map