export class XPathRule {
    public name: string;
    public xPath: string;
    public values: string[];
}
export class XPathOptions {
    public rules: Map<string, XPathRule[]>;
    public loadDefaults(): void {
        this.rules = new Map();
        this.rules.set(
            'force-app/main/default/profiles/*.profile-meta.xml',
            [
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
                        'Account.Tradestyle'],
                },
                {
                    name: 'Bad UserPermissions',
                    xPath: "//*[local-name()='Profile']/*[local-name()='userPermissions']/*[local-name()='name']/text()",
                    values: ['EnableCommunityAppLauncher',
                        'WorkDotComUserPerm',
                        'WorkCalibrationUser',
                        'CreateContentSpace'],
                }
            ],
        );
    }
}


