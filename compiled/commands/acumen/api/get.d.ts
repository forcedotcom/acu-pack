import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
export default class Unmask extends CommandBase {
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        metadata: flags.Discriminated<flags.Option<string>>;
        ids: flags.Discriminated<flags.Option<string>>;
        output: flags.Discriminated<flags.Option<string>>;
        tooling: flags.Discriminated<flags.Boolean<boolean>>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    run(): Promise<void>;
}
