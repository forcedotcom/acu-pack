"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sfdx_core_1 = require("./sfdx-core");
class XPathRule {
}
exports.XPathRule = XPathRule;
class XPathOptions {
    constructor() {
        this.rules = new Map();
    }
    static deserialize(serializedOptions) {
        const xPathOptions = new XPathOptions();
        xPathOptions.rules = new Map(JSON.parse(serializedOptions));
        return xPathOptions;
    }
    serialize() {
        return JSON.stringify(Array.from(this.rules.entries()), null, sfdx_core_1.SfdxCore.jsonSpaces);
    }
    loadDefaults() {
        this.rules.set('force-app/main/default/profiles/*.profile-meta.xml', [
            {
                name: 'Bad FieldPermissions',
                xPath: "//*[local-name()='Profile']/*[local-name()='fieldPermissions']/*[local-name()='field']/text()",
                values: ['Account.CleanStatus',
                    'Lead.CleanStatus',
                    'Account.DandbCompanyId',
                    'Lead.DandbCompanyId',
                    'Account.DunsNumber',
                    'Lead.CompanyDunsNumber',
                    'Account.NaicsCode',
                    'Account.NaicsDesc',
                    'Lead.PartnerAccountId',
                    'Account.YearStarted',
                    'Account.Tradestyle']
            },
            {
                name: 'Bad UserPermissions',
                xPath: "//*[local-name()='Profile']/*[local-name()='userPermissions']/*[local-name()='name']/text()",
                values: ['EnableCommunityAppLauncher',
                    'WorkDotComUserPerm',
                    'WorkCalibrationUser',
                    'CreateContentSpace']
            }
        ]);
    }
}
exports.XPathOptions = XPathOptions;
//# sourceMappingURL=xpath-options.js.map