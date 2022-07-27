import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
export default class Access extends CommandBase {
    static description: string;
    static defaultReportPath: string;
    static examples: string[];
    protected static flagsConfig: {
        applist: flags.Discriminated<flags.String>;
        report: flags.Discriminated<flags.String>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    static getAppAccess(appMenuItems: any[], permissionSetMap: Map<string, any>, getSetupEntityAccessCallback: (id: string, label: string) => Promise<any[]>, getPermissionSetAssignmentCallback: (id: string, label: string) => Promise<any[]>): Promise<Map<string, any[]>>;
    protected runInternal(): Promise<void>;
}
