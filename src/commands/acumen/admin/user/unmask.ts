import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
import { SfdxQuery } from '../../../../lib/sfdx-query';
import { SfdxTasks } from '../../../../lib/sfdx-tasks';
import { SfdxClient, RestAction } from '../../../../lib/sfdx-client';
import Utils from '../../../../lib/utils';
import { UnmaskOptions } from '../../../../lib/unmask-options';

export default class Unmask extends CommandBase {
  public static description = CommandBase.messages.getMessage('admin.user.unmask.commandDescription');

  public static examples = [
    `$ sfdx admin:user:unmask -u myOrgAlias -l 'user1@sf.com, user2@sf.com, user3@sf.com'
    Removes the .invalid extension from the email address associated to the list of specified users in the specified Org.`,
    `$ sfdx admin:user:unmask -u myOrgAlias -f qa-users.txt
    Removes the .invalid extension from the email address associated to the list of users in the specified file in the specified Org.`
  ];

  protected static flagsConfig = {
    userlist: flags.string({
      char: 'l',
      description: CommandBase.messages.getMessage('admin.user.unmask.userListFlagDescription')
    }),
    userfile: flags.string({
      char: 'f',
      description: CommandBase.messages.getMessage('admin.user.unmask.userFileFlagDescription')
    })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<void> {
    const username = this.flags.targetusername;
    const orgId = this.org.getOrgId();

    let hasErrors = false;
    try {
      this.ux.log(`Connecting to Org: ${username}(${orgId})`);
      this.ux.log('Unmasking users...');

      let usernames: string[] = null;
      let options = new UnmaskOptions();

      if (this.flags.userlist) {
        usernames = this.flags.userlist.split(',');
      } else if (this.flags.userfile) {
        options = await SfdxTasks.getUnmaskOptionsAsync(this.flags.userfile);
        if (!options) {
          this.ux.log(`Unable to read options file: ${this.flags.userfile}.`);
          // Set the proper exit code to indicate violation/failure
          process.exitCode = 1;
          return;
        }
        for (const [org, orgUsers] of options.sandboxes) {
          if (username.toUpperCase() === org.toUpperCase()) {
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

      const query = `${options.userQuery} AND Username ${SfdxQuery.getInClause(usernames)}`;

      this.ux.log('');
      this.ux.log('User Query:');
      this.ux.log(query);
      this.ux.log('');

      const users = await SfdxQuery.doSoqlQueryAsync(username, query);
      if (!users || users.length === 0) {
        this.ux.log('No Users Found.');
        return;
      }

      this.ux.log('Users Found:');
      for (const user of users) {
        this.ux.log(user.Username);
      }

      const patchObj = {
        allOrNone: false,
        records: []
      };

      for (const user of users) {
        user.newEmail = Utils.unmaskEmail(user.Email);
        patchObj.records.push({
          attributes: { type: 'User' },
          id: user.Id,
          Email: user.newEmail
        });
      }

      if (patchObj.records.length !== 0) {
        this.ux.log('Unmasking Users...');
        const sfdxClient = new SfdxClient(username);
        const results = await sfdxClient.doComposite(RestAction.PATCH, patchObj);
        for (const result of results) {
          for (const user of users) {
            if (user.Id === result.id) {
              if (result.success) {
                this.ux.log(`${user.Username} ${user.Email} => ${user.newEmail}`);
              } else {
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
    } catch (err) {
      process.exitCode = 1;
      throw err;
    } finally {
      if (hasErrors) {
        process.exitCode = 1;
      }
      this.ux.log('Done.');
    }
  }
}
