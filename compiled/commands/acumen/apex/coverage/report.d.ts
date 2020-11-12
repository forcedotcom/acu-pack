import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
export default class Report extends CommandBase {
    static defaultJobStatusWaitMax: number;
    static description: string;
    static defaultReportPath: string;
    static examples: string[];
    protected static flagsConfig: {
        report: flags.Discriminated<flags.Option<string>>;
        wait: flags.Discriminated<flags.Number>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    run(): Promise<void>;
}
