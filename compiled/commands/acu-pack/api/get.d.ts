import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
export default class Unmask extends CommandBase {
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        metadata: flags.Discriminated<flags.String>;
        ids: flags.Discriminated<flags.String>;
        output: flags.Discriminated<flags.String>;
        tooling: flags.Discriminated<flags.Boolean<boolean>>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    protected runInternal(): Promise<void>;
}
