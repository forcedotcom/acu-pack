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
    private permissionSetMap;
    protected runInternal(): Promise<void>;
}
