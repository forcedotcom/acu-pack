"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const sfdx_query_1 = require("../../../../lib/sfdx-query");
const options_factory_1 = require("../../../../lib/options-factory");
const sfdx_client_1 = require("../../../../lib/sfdx-client");
const utils_1 = require("../../../../lib/utils");
const utils_2 = require("../../../../lib/utils");
const unmask_options_1 = require("../../../../lib/unmask-options");
class Unmask extends command_base_1.CommandBase {
    async run() {
        let hasErrors = false;
        try {
            this.ux.log(`Connecting to Org: ${this.orgAlias}(${this.orgId})`);
            this.ux.log('Unmasking users...');
            let usernames = null;
            let options = new unmask_options_1.UnmaskOptions();
            if (this.flags.userlist) {
                usernames = this.flags.userlist.split(',');
            }
            else if (this.flags.userfile) {
                options = await options_factory_1.OptionsFactory.get(unmask_options_1.UnmaskOptions, this.flags.userfile);
                if (!options) {
                    this.ux.log(`Unable to read options file: ${this.flags.userfile}.`);
                    // Set the proper exit code to indicate violation/failure
                    process.exitCode = 1;
                    return;
                }
                for (const [org, orgUsers] of options.sandboxes) {
                    if (this.orgAlias.toUpperCase() === org.toUpperCase()) {
                        usernames = orgUsers;
                        break;
                    }
                }
            }
            if (!options.userQuery) {
                this.ux.log('No userQuery defined.');
                // Set the proper exit code to indicate violation/failure
                process.exitCode = 1;
                return;
            }
            if (!usernames || usernames.length === 0) {
                this.ux.log('No usernames specified.');
                // Set the proper exit code to indicate violation/failure
                process.exitCode = 1;
                return;
            }
            this.ux.log('Retrieving Users...');
            if (!options.userQuery.endsWith(' ')) {
                options.userQuery += ' ';
            }
            if (!options.userQuery.toUpperCase().includes('WHERE')) {
                options.userQuery += 'WHERE';
            }
            else {
                options.userQuery += 'AND';
            }
            const query = `${options.userQuery} Username ${sfdx_query_1.SfdxQuery.getInClause(usernames)}`;
            this.ux.log('');
            this.ux.log('User Query:');
            this.ux.log(query);
            this.ux.log('');
            const foundMap = new Map();
            foundMap.set(true, []);
            foundMap.set(false, []);
            const unmaskUsers = [];
            const users = await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, query);
            this.ux.log('User Query Results:');
            for (const username of usernames) {
                let found = false;
                for (const user of users) {
                    if (username === user.Username) {
                        found = true;
                        if (user.Email.endsWith('.invalid')) {
                            unmaskUsers.push(user);
                        }
                        break;
                    }
                }
                foundMap.get(found).push(username);
            }
            for (const [found, names] of foundMap.entries()) {
                this.ux.log(`${found ? 'Found' : 'NOT Found'}:`);
                for (const name of names) {
                    this.ux.log(`\t${name}`);
                }
            }
            if (!unmaskUsers || unmaskUsers.length === 0) {
                this.ux.log('No Masked Users Found.');
                return;
            }
            const patchObj = {
                allOrNone: false,
                records: []
            };
            for (const user of unmaskUsers) {
                user.newEmail = utils_1.default.unmaskEmail(user.Email);
                patchObj.records.push({
                    attributes: { type: 'User' },
                    id: user.Id,
                    Email: user.newEmail
                });
            }
            if (patchObj.records.length !== 0) {
                this.ux.log('Unmasking Users...');
                const sfdxClient = new sfdx_client_1.SfdxClient(this.orgAlias);
                const results = await sfdxClient.doComposite(utils_2.RestAction.PATCH, patchObj);
                for (const result of results.getContent()) {
                    for (const user of unmaskUsers) {
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