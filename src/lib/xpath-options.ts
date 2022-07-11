import { OptionsBase } from './options';
import { SfdxCore } from './sfdx-core';

export class XPathRule {
    public name: string;
    public xPath: string;
    public values: string[];
}
export class XPathOptions extends OptionsBase {
    public rules: Map<string, XPathRule[]>;

    public constructor() {
        super();
        this.rules = new Map();
    }

    public async deserialize(serializedOptions: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                if (!serializedOptions) {
                    return null;
                }
                const rules = new Map<string, XPathRule[]>(JSON.parse(serializedOptions));
                if (rules) {
                    this.rules = rules;
                }
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    public serialize(): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                resolve(JSON.stringify(Array.from(this.rules.entries()), null, SfdxCore.jsonSpaces));
            } catch (err) {
                reject(err);
            }
        });
    }

    public loadDefaults(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
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
                    ]
                );
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }
}
