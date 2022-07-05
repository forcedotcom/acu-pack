import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
import { SfdxQuery } from '../../../../lib/sfdx-query';
import { SfdxTasks } from '../../../../lib/sfdx-tasks';
import { SfdxClient, ApiKind, NO_CONTENT_CODE } from '../../../../lib/sfdx-client';
import { RestAction } from '../../../../lib/utils';

export default class Delete extends CommandBase {
  public static description = CommandBase.messages.getMessage('admin.workspace.delete.commandDescription');

  public static examples = [
    `$ sfdx admin:workspace:delete -u myOrgAlias
    Deletes the Developer Console IDEWorkspace objects for the specified target username (-u).`,
    `$ sfdx admin:workspace:delete -u myOrgAlias -l 'user1@sf.com, user2@sf.com, user3@sf.com'
    Deletes the Developer Console IDEWorkspace objects for the specified list of users (-l).`
  ];

  protected static flagsConfig = {
    userlist: flags.string({
      char: 'l',
      description: CommandBase.messages.getMessage('admin.workspace.delete.userListFlagDescription')
    })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<void> {
    let hasErrors = false;
    try {
      this.ux.log(`Connecting to Org: ${this.orgAlias}(${this.orgId})`);

      const usernames: string[] = [];
      if (this.flags.userlist) {
        for (const username of this.flags.userlist.split(',')) {
          usernames.push(username.trim());
        }

      } else {
        const orgInfo = await SfdxTasks.getOrgInfo(this.orgAlias);
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
      const sfdxClient = new SfdxClient(this.orgAlias);
      for (const username of usernames) {
        const query = `SELECT Id FROM IDEWorkspace WHERE CreatedById IN (SELECT Id FROM User WHERE Username = '${username}')`;
        const workspaceIds = await SfdxQuery.doSoqlQuery(this.orgAlias, query, null, null, true);
        if (!workspaceIds || workspaceIds.length === 0) {
          this.ux.log(`No workspaces found for user: '${username}'.`);
          continue;
        }
        try {
          for await (const result of sfdxClient.do(RestAction.DELETE, 'IDEWorkspace', workspaceIds, 'Id', ApiKind.TOOLING, [NO_CONTENT_CODE])) {
            this.ux.log(`Deleted Workspace(${result}) for user: '${username}'.`);
          }

        } catch (err) {
          this.ux.log(`Error Deleting Workspace(s) (${workspaceIds}) for user: '${username}'.`);
          hasErrors = true;
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
