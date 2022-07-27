"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const sfdx_query_1 = require("../../../../lib/sfdx-query");
const office_1 = require("../../../../lib/office");
class AccessDetail {
}
class Access extends command_base_1.CommandBase {
    constructor() {
        super(...arguments);
        // private static skipPermissionSetLabelLike = '00e%';
        this.permissionSetMap = new Map();
    }
    async runInternal() {
        var _a, _b, _c;
        const appAccessByAppLabel = new Map();
        const permissionSetsById = new Map();
        this.ux.log('Getting PermissionSets...');
        const query3 = 'SELECT Id, Label FROM PermissionSet';
        const permissionSets = await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, query3);
        for (const permissionSet of permissionSets) {
            this.permissionSetMap.set(permissionSet.Id, permissionSet);
        }
        let apps = null;
        if (this.flags.applist) {
            apps = this.flags.applist.split(',');
        }
        let query = 'SELECT Id, ApplicationId, Name, Label FROM AppMenuItem';
        if (apps.length > 0) {
            const appsFilter = `'${apps.join("','")}'`;
            query += ` WHERE Label IN (${appsFilter})`;
            this.ux.log(`Getting Apps: ${appsFilter}`);
        }
        else {
            this.ux.log('Getting Apps: All');
        }
        const appMenuItems = await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, query);
        for (const appMenuItem of appMenuItems) {
            const appId = String(appMenuItem.ApplicationId);
            this.ux.log(`Getting permissions for App: ${String(appMenuItem.Label)}<${appId}>`);
            const query2 = 'SELECT Id, SetupEntityId, SetupEntityType, ParentId ' +
                'FROM SetupEntityAccess ' +
                `WHERE SetupEntityType = 'TabSet' AND SetupEntityId = '${appId}'`;
            const setupEntityAccesses = await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, query2);
            for (const setupEntityAccess of setupEntityAccesses) {
                const permissionSet = this.permissionSetMap.get(String(setupEntityAccess.ParentId));
                if (!permissionSet) {
                    continue;
                }
                // Chekc and see if we have already gotten the assigments for this PermSet
                let permissionSetAssignments = permissionSetsById.get(permissionSet.Id);
                if (!permissionSetAssignments) {
                    this.ux.log(`Getting Users for PermissionSet: ${String(permissionSet.Label)}`);
                    const query4 = 'SELECT Id, PermissionSetId, PermissionSet.Label, PermissionSet.ProfileId, ' +
                        'PermissionSet.Profile.Name, AssigneeId, Assignee.Username, ExpirationDate ' +
                        'FROM PermissionSetAssignment ' +
                        `WHERE PermissionSetId = '${String(permissionSet.Id)}'`;
                    // const query4 = `SELECT Id, PermissionSetId, AssigneeId, Assignee.Name, Assignee.Username FROM PermissionSetAssignment WHERE PermissionSetId = '${String(permissionSet.Id)}'`;
                    permissionSetAssignments = await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, query4);
                    permissionSetsById.set(permissionSet.Id, permissionSetAssignments);
                }
                else {
                    this.ux.log(`Reusing Users for PermissionSet: ${String(permissionSet.Label)}`);
                }
                for (const permissionSetAssignment of permissionSetAssignments) {
                    const accessDetail = new AccessDetail();
                    // User info
                    accessDetail.userId = permissionSetAssignment.AssigneeId;
                    accessDetail.username = (_a = permissionSetAssignment.Assignee) === null || _a === void 0 ? void 0 : _a.Username;
                    // PermissionSet Info
                    accessDetail.permSetId = permissionSetAssignment.PermissionSetId;
                    accessDetail.permSetLabel = (_b = permissionSetAssignment.PermissionSet) === null || _b === void 0 ? void 0 : _b.Label;
                    // Profile Info
                    accessDetail.profileId = permissionSetAssignment.PermissionSet.ProfileId;
                    accessDetail.profileLabel = (_c = permissionSetAssignment.PermissionSet.Profile) === null || _c === void 0 ? void 0 : _c.Name;
                    // Expiration?
                    accessDetail.expirationDate = permissionSetAssignment.ExpirationDate;
                    if (!appAccessByAppLabel.has(appMenuItem.Label)) {
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
            const workbookMap = new Map();
            for (const appLabel of appAccessByAppLabel.keys()) {
                const sheet = [['Username', 'User Id', 'PermissionSet Label', 'PermissionSet Id', 'Profile Label', 'Profile Id', 'Expiration Date']];
                for (const accessDetail of appAccessByAppLabel.get(appLabel)) {
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
            office_1.Office.writeXlxsWorkbook(workbookMap, reportPath);
        }
        catch (err) {
            this.ux.log('Error Writing XLSX Report: ' + JSON.stringify(err.message));
            throw err;
        }
    }
}
exports.default = Access;
Access.description = command_base_1.CommandBase.messages.getMessage('admin.user.access.commandDescription');
Access.defaultReportPath = 'UserAccess-{ORG}.xlsx';
Access.examples = [
    `$ sfdx admin:user:access -u myOrgAlias -l 'user1@sf.com, user2@sf.com, user3@sf.com'
    Removes the .invalid extension from the email address associated to the list of specified users in the specified Org.`
];
Access.flagsConfig = {
    applist: command_1.flags.string({
        char: 'l',
        description: command_base_1.CommandBase.messages.getMessage('admin.user.access.appListFlagDescription')
    }),
    report: command_1.flags.string({
        char: 'r',
        description: command_base_1.CommandBase.messages.getMessage('admin.user.access.reportFlagDescription', [
            Access.defaultReportPath,
        ]),
    }),
};
// Comment this out if your command does not require an org username
Access.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Access.requiresProject = false;
//# sourceMappingURL=access.js.map