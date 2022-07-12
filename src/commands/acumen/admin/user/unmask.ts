import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
import { SfdxQuery } from '../../../../lib/sfdx-query';
import { OptionsFactory } from '../../../../lib/options-factory';
import { SfdxClient } from '../../../../lib/sfdx-client';
import Utils from '../../../../lib/utils';
import { RestAction } from '../../../../lib/utils';
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

  protected async runInternal(): Promise<void> {
    this.ux.log('Unmasking users...');

    let usernames: string[] = null;
    let options = new UnmaskOptions();

    if (this.flags.userlist) {
      usernames = this.flags.userlist.split(',');
    } else if (this.flags.userfile) {
      options = await OptionsFactory.get(UnmaskOptions, this.flags.userfile);
      if (!options) {
        this.ux.log(`Unable to read options file: ${this.flags.userfile as string}.`);
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
    } else {
      options.userQuery += 'AND';
    }
    const query = `${options.userQuery} Username ${SfdxQuery.getInClause(usernames)}`;

    this.ux.log('');
    this.ux.log('User Query:');
    this.ux.log(query);
    this.ux.log('');

    const foundMap = new Map<boolean, string[]>();
    foundMap.set(true, []);
    foundMap.set(false, []);
    const unmaskUsers = [];

    const users = await SfdxQuery.doSoqlQuery(this.orgAlias, query);

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
      user.newEmail = Utils.unmaskEmail(user.Email);
      patchObj.records.push({
        attributes: { type: 'User' },
        id: user.Id,
        Email: user.newEmail
      });
    }

    if (patchObj.records.length !== 0) {
      this.ux.log('Unmasking Users...');
      const sfdxClient = new SfdxClient(this.orgAlias);
      const results = await sfdxClient.doComposite(RestAction.PATCH, patchObj);
      for (const result of results.getContent()) {
        for (const user of unmaskUsers) {
          if (user.Id === result.id) {
            if (result.success) {
              this.ux.log(`${user.Username as string} ${user.Email as string} => ${user.newEmail as string}`);
            } else {
              this.ux.log(`${user.Username as string} ${user.Email as string}`);
              for (const error of result.errors) {
                this.ux.log(`\t=> ${error as string}`);
              }
            }
            break;
          }
        }
      }
    }
  }
}
