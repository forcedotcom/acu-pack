import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
export default class Coverage extends CommandBase {
    static defaultJobStatusWaitMax: number;
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        wait: flags.Discriminated<flags.Number>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    run(): Promise<void>;
}
