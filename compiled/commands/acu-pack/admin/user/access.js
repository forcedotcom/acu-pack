"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const sfdx_query_1 = require("../../../../lib/sfdx-query");
const office_1 = require("../../../../lib/office");
class Access extends command_base_1.CommandBase {
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
    static async getAppAccess(appMenuItems, permissionSetMap, getSetupEntityAccessCallback, getPermissionSetAssignmentCallback) {
        const permissionSetsById = new Map();
        const appAccessByAppLabel = new Map();
        for (const appMenuItem of appMenuItems) {
            const setupEntityAccesses = await getSetupEntityAccessCallback(String(appMenuItem.ApplicationId), String(appMenuItem.Label));
            for (const setupEntityAccess of setupEntityAccesses) {
                const permissionSet = permissionSetMap.get(String(setupEntityAccess.ParentId));
                if (!permissionSet) {
                    continue;
                }
                // Chekc and see if we have already gotten the assigments for this PermSet
                let permissionSetAssignments = permissionSetsById.get(permissionSet.Id);
                if (!permissionSetAssignments) {
                    permissionSetAssignments = await getPermissionSetAssignmentCallback(permissionSet.Id, permissionSet.Label);
                    permissionSetsById.set(permissionSet.Id, permissionSetAssignments);
                }
                if (!appAccessByAppLabel.has(appMenuItem.Label)) {
                    appAccessByAppLabel.set(appMenuItem.Label, []);
                }
                appAccessByAppLabel.get(appMenuItem.Label).push(...permissionSetAssignments);
            }
        }
        return appAccessByAppLabel;
    }
    async runInternal() {
        var _a, _b, _c, _d;
        let apps = null;
        if (this.flags.applist) {
            apps = this.flags.applist.split(',');
        }
        this.ux.log('Getting PermissionSets...');
        const query3 = 'SELECT Id, Label FROM PermissionSet';
        const permissionSets = await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, query3);
        const permissionSetMap = new Map();
        for (const permissionSet of permissionSets) {
            permissionSetMap.set(permissionSet.Id, permissionSet);
        }
        let query = 'SELECT Id, ApplicationId, Name, Label FROM AppMenuItem';
        if ((apps === null || apps === void 0 ? void 0 : apps.length) > 0) {
            const appsFilter = `'${apps.join("','")}'`;
            query += ` WHERE Label IN (${appsFilter})`;
            this.ux.log(`Getting Specific App Access: ${appsFilter}`);
        }
        else {
            this.ux.log('Getting All App Access');
        }
        const appMenuItems = await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, query);
        const getSetupEntityAccessCallBack = async (id, label) => {
            this.ux.log(`Getting permissions for App: ${label}<${id}>`);
            /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
            return await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, 'SELECT Id, SetupEntityId, ParentId ' +
                'FROM SetupEntityAccess ' +
                `WHERE SetupEntityType = 'TabSet' AND SetupEntityId = '${id}'`);
        };
        const getPermissionSetAssignmentCallback = async (id, label) => {
            this.ux.log(`Getting Users for PermissionSet: ${label}<${id}>`);
            /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
            return await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, 'SELECT Id, PermissionSetId, PermissionSet.Label, PermissionSet.ProfileId, ' +
                'PermissionSet.Profile.Name, AssigneeId, Assignee.Username, ExpirationDate ' +
                'FROM PermissionSetAssignment ' +
                `WHERE PermissionSetId = '${id}'`);
        };
        const appAccessByAppLabel = await Access.getAppAccess(appMenuItems, permissionSetMap, getSetupEntityAccessCallBack, getPermissionSetAssignmentCallback);
        try {
            const reportPath = path
                .resolve(this.flags.report || Access.defaultReportPath)
                .replace(/\{ORG\}/, this.orgAlias);
            this.ux.log(`Writing Report: ${reportPath}`);
            // create a workbook with a Tab for each App
            const workbookMap = new Map();
            for (const appLabel of appAccessByAppLabel.keys()) {
                const sheet = [['Username', 'User Id', 'PermissionSet Label', 'PermissionSet Id', 'Profile Label', 'Profile Id', 'Expiration Date']];
                for (const permissionSetAssignment of appAccessByAppLabel.get(appLabel)) {
                    sheet.push([
                        (_a = permissionSetAssignment.Assignee) === null || _a === void 0 ? void 0 : _a.Username,
                        permissionSetAssignment.AssigneeId,
                        (_b = permissionSetAssignment.PermissionSet) === null || _b === void 0 ? void 0 : _b.Label,
                        permissionSetAssignment.PermissionSetId,
                        (_d = (_c = permissionSetAssignment.PermissionSet) === null || _c === void 0 ? void 0 : _c.Profile) === null || _d === void 0 ? void 0 : _d.Name,
                        permissionSetAssignment.ExpirationDate,
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
    `$ sfdx admin:user:access -u myOrgAlias
    Creates a report ${Access.defaultReportPath.replace(/\{ORG\}/, 'myOrgAlias')}on User access to all the Apps based on PermisionSets and Profiles.`,
    `$ sfdx admin:user:access -u myOrgAlias -l 'Sales','Platform'
    Creates a report ${Access.defaultReportPath.replace(/\{ORG\}/, 'myOrgAlias')}on User access to the specified Apps based on PermisionSets and Profiles.`
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