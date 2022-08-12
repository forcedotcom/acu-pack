import path = require('path');
import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
import { SfdxQuery } from '../../../../lib/sfdx-query';
import { Office } from '../../../../lib/office';

export default class Access extends CommandBase {
  public static description = CommandBase.messages.getMessage('admin.user.access.commandDescription');

  public static defaultReportPath = 'UserAccess-{ORG}.xlsx';

  public static examples = [
    `$ sfdx admin:user:access -u myOrgAlias
    Creates a report ${Access.defaultReportPath.replace(
      /\{ORG\}/,
      'myOrgAlias'
    )}on User access to all the Apps based on PermisionSets and Profiles.`,
    `$ sfdx admin:user:access -u myOrgAlias -l 'Sales','Platform'
    Creates a report ${Access.defaultReportPath.replace(
      /\{ORG\}/,
      'myOrgAlias'
    )}on User access to the specified Apps based on PermisionSets and Profiles.`
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

  /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
  public static async getAppAccess(
    appMenuItems: any[],
    permissionSetMap: Map<string,any>,
    getSetupEntityAccessCallback: (id: string, label: string) => Promise<any[]>,
    getPermissionSetAssignmentCallback: (id: string, label: string) => Promise<any[]> ): Promise<Map<string, any[]>> {

    const permissionSetsById = new Map<string, any[]>();
    
    const appAccessByAppLabel = new Map<string, any[]>();

    for( const appMenuItem of appMenuItems) {
      const setupEntityAccesses = await getSetupEntityAccessCallback(
        String(appMenuItem.ApplicationId), 
        String(appMenuItem.Label)
      );
      for(const setupEntityAccess of setupEntityAccesses) {
        const permissionSet = permissionSetMap.get(String(setupEntityAccess.ParentId));
        if(!permissionSet) {
          continue;
        }

        // Chekc and see if we have already gotten the assigments for this PermSet
        let permissionSetAssignments = permissionSetsById.get(permissionSet.Id);
        if(!permissionSetAssignments) {
          permissionSetAssignments = await getPermissionSetAssignmentCallback(
            permissionSet.Id,
            permissionSet.Label
          );
          permissionSetsById.set(permissionSet.Id, permissionSetAssignments);
        }
        
        if(!appAccessByAppLabel.has(appMenuItem.Label)) {
          appAccessByAppLabel.set(appMenuItem.Label, []);
        }
        appAccessByAppLabel.get(appMenuItem.Label).push(...permissionSetAssignments);
      }
    }
    return appAccessByAppLabel;
  }

  protected async runInternal(): Promise<void> {
    let apps: string[] = null;
    if (this.flags.applist) {
      apps = this.flags.applist.split(',');
    }

    this.ux.log('Getting PermissionSets...');
    const query3 = 'SELECT Id, Label FROM PermissionSet';
    const permissionSets = await SfdxQuery.doSoqlQuery(this.orgAlias, query3);
    const permissionSetMap = new Map<string,any>();
    for(const permissionSet of permissionSets) {
      permissionSetMap.set(permissionSet.Id, permissionSet);
    }

    let query = 'SELECT Id, ApplicationId, Name, Label FROM AppMenuItem';
    if(apps?.length > 0) {
      const appsFilter = `'${apps.join("','")}'`;
      query += ` WHERE Label IN (${appsFilter})`;
      this.ux.log(`Getting Specific App Access: ${appsFilter}`);
    } else {
      this.ux.log('Getting All App Access');
    }
    const appMenuItems = await SfdxQuery.doSoqlQuery(this.orgAlias, query);

    const getSetupEntityAccessCallBack = async (id: string, label: string): Promise<any> => {
      this.ux.log(`Getting permissions for App: ${label}<${id}>`);
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
      return await SfdxQuery.doSoqlQuery(this.orgAlias, 'SELECT Id, SetupEntityId, ParentId ' + 
      'FROM SetupEntityAccess ' + 
      `WHERE SetupEntityType = 'TabSet' AND SetupEntityId = '${id}'`);
    }

    const getPermissionSetAssignmentCallback = async (id: string, label: string): Promise<any[]> => {
      this.ux.log(`Getting Users for PermissionSet: ${label}<${id}>`);
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
      return await SfdxQuery.doSoqlQuery(this.orgAlias, 'SELECT Id, PermissionSetId, PermissionSet.Label, PermissionSet.ProfileId, '+
      'PermissionSet.Profile.Name, AssigneeId, Assignee.Username, ExpirationDate '+
      'FROM PermissionSetAssignment ' +
      `WHERE PermissionSetId = '${id}'`);
    }

    const appAccessByAppLabel = await Access.getAppAccess(
      appMenuItems, 
      permissionSetMap,
      getSetupEntityAccessCallBack,
      getPermissionSetAssignmentCallback
    );

    // create a workbook with a Tab for each App
    const workbookMap = new Map<string, string[][]>();
    try {
      const reportPath = path
        .resolve(this.flags.report || Access.defaultReportPath)
        .replace(/\{ORG\}/, this.orgAlias);
      this.ux.log(`Writing Report: ${reportPath}`);
      for (const appLabel of appAccessByAppLabel.keys() ) {
        const sheet: string[][] = [['Username', 'User Id','PermissionSet Label','PermissionSet Id','Profile Label','Profile Id','Expiration Date']];
        for (const permissionSetAssignment of appAccessByAppLabel.get(appLabel) ) {
          sheet.push([
            permissionSetAssignment.Assignee?.Username,
            permissionSetAssignment.AssigneeId,
            permissionSetAssignment.PermissionSet?.Label,
            permissionSetAssignment.PermissionSetId,
            permissionSetAssignment.PermissionSet?.Profile?.Name,
            permissionSetAssignment.ExpirationDate,
          ]);
        }
        workbookMap.set(appLabel, sheet);
      }
      Office.writeXlxsWorkbook(workbookMap, reportPath);
    } catch (err) {
      this.ux.log('Error Writing XLSX Report: ' + JSON.stringify(err.message));
      this.ux.log('Report: ' + JSON.stringify(workbookMap));
      throw err;
    }
  }
}
