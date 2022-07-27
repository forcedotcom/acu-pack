import path = require('path');
import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
import { SfdxQuery } from '../../../../lib/sfdx-query';
import { Office } from '../../../../lib/office';

class AccessDetail {
  public permSetLabel: string;
  public permSetId: string;
  public profileLabel: string;
  public profileId: string;
  public username: string;
  public userId: string;
  public expirationDate: string;
}
export default class Access extends CommandBase {
  public static description = CommandBase.messages.getMessage('admin.user.access.commandDescription');

  public static defaultReportPath = 'UserAccess-{ORG}.xlsx';

  public static examples = [
    `$ sfdx admin:user:access -u myOrgAlias -l 'user1@sf.com, user2@sf.com, user3@sf.com'
    Removes the .invalid extension from the email address associated to the list of specified users in the specified Org.`
  ];

  protected static flagsConfig = {
    applist: flags.string({
      char: 'l',
      description: CommandBase.messages.getMessage('admin.user.access.appListFlagDescription')
    }),
    report: flags.string({
      char: 'r',
      description: CommandBase.messages.getMessage('admin.user.access.reportFlagDescription', [
        Access.defaultReportPath,
      ]),
    }),
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  // private static skipPermissionSetLabelLike = '00e%';

  private permissionSetMap = new Map<string,any>();

  protected async runInternal(): Promise<void> {
    const appAccessByAppLabel = new Map<string, AccessDetail[]>();
    const permissionSetsById = new Map<string, any[]>();

    this.ux.log('Getting PermissionSets...');
    const query3 = 'SELECT Id, Label FROM PermissionSet';
    const permissionSets = await SfdxQuery.doSoqlQuery(this.orgAlias, query3);
    for(const permissionSet of permissionSets) {
      this.permissionSetMap.set(permissionSet.Id, permissionSet);
    }

    let apps: string[] = null;
    if (this.flags.applist) {
      apps = this.flags.applist.split(',');
    }

    let query = 'SELECT Id, ApplicationId, Name, Label FROM AppMenuItem';
    if(apps.length > 0) {
      const appsFilter = `'${apps.join("','")}'`;
      query += ` WHERE Label IN (${appsFilter})`;
      this.ux.log(`Getting Apps: ${appsFilter}`);
    } else {
      this.ux.log('Getting Apps: All');
    }
    const appMenuItems = await SfdxQuery.doSoqlQuery(this.orgAlias, query);

    for( const appMenuItem of appMenuItems) {
      const appId = String(appMenuItem.ApplicationId);
      this.ux.log(`Getting permissions for App: ${String(appMenuItem.Label)}<${appId}>`);
      const query2 = 'SELECT Id, SetupEntityId, SetupEntityType, ParentId ' + 
      'FROM SetupEntityAccess ' + 
      `WHERE SetupEntityType = 'TabSet' AND SetupEntityId = '${appId}'`;
      const setupEntityAccesses = await SfdxQuery.doSoqlQuery(this.orgAlias, query2);
      for(const setupEntityAccess of setupEntityAccesses) {
        const permissionSet = this.permissionSetMap.get(String(setupEntityAccess.ParentId));
        if(!permissionSet) {
          continue;
        }

        // Chekc and see if we have already gotten the assigments for this PermSet
        let permissionSetAssignments = permissionSetsById.get(permissionSet.Id);
        if(!permissionSetAssignments) {
          this.ux.log(`Getting Users for PermissionSet: ${String(permissionSet.Label)}`);
        
          const query4 = 'SELECT Id, PermissionSetId, PermissionSet.Label, PermissionSet.ProfileId, '+
          'PermissionSet.Profile.Name, AssigneeId, Assignee.Username, ExpirationDate '+
          'FROM PermissionSetAssignment ' +
          `WHERE PermissionSetId = '${String(permissionSet.Id)}'`;
          // const query4 = `SELECT Id, PermissionSetId, AssigneeId, Assignee.Name, Assignee.Username FROM PermissionSetAssignment WHERE PermissionSetId = '${String(permissionSet.Id)}'`;
          permissionSetAssignments = await SfdxQuery.doSoqlQuery(this.orgAlias, query4);
          permissionSetsById.set(permissionSet.Id, permissionSetAssignments);
        } else {
          this.ux.log(`Reusing Users for PermissionSet: ${String(permissionSet.Label)}`);
        }
        
        for(const permissionSetAssignment of permissionSetAssignments) {
          const accessDetail = new AccessDetail();
          // User info
          accessDetail.userId = permissionSetAssignment.AssigneeId;
          accessDetail.username = permissionSetAssignment.Assignee?.Username;

          // PermissionSet Info
          accessDetail.permSetId = permissionSetAssignment.PermissionSetId;
          accessDetail.permSetLabel = permissionSetAssignment.PermissionSet?.Label;

          // Profile Info
          accessDetail.profileId = permissionSetAssignment.PermissionSet.ProfileId;
          accessDetail.profileLabel = permissionSetAssignment.PermissionSet.Profile?.Name;
          
          // Expiration?
          accessDetail.expirationDate = permissionSetAssignment.ExpirationDate;

          if(!appAccessByAppLabel.has(appMenuItem.Label)) {
            appAccessByAppLabel.set(appMenuItem.Label, []);
          }
          appAccessByAppLabel.get(appMenuItem.Label).push(accessDetail);
        }
      }
    }
    
    try {
      const reportPath = path
        .resolve(this.flags.report || Access.defaultReportPath)
        .replace(/\{ORG\}/, this.orgAlias);
      this.ux.log(`Writing Report: ${reportPath}`);

      // create a workbook with a Tab for each App
      const workbookMap = new Map<string, string[][]>();
      for (const appLabel of appAccessByAppLabel.keys() ) {
        const sheet: string[][] = [['Username', 'User Id','PermissionSet Label','PermissionSet Id','Profile Label','Profile Id','Expiration Date']];
        for (const accessDetail of appAccessByAppLabel.get(appLabel) ) {
          sheet.push([
            accessDetail.username,
            accessDetail.userId,
            accessDetail.permSetLabel,
            accessDetail.permSetId,
            accessDetail.profileLabel,
            accessDetail.profileId,
            accessDetail.expirationDate
          ]);
        }
        workbookMap.set(appLabel, sheet);
      }
      Office.writeXlxsWorkbook(workbookMap, reportPath);
    } catch (err) {
      this.ux.log('Error Writing XLSX Report: ' + JSON.stringify(err.message));
      throw err;
    }
  }
}
