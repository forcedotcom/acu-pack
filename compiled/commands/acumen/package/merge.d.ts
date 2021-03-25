import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
export default class Merge extends CommandBase {
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        source: flags.Discriminated<flags.Option<string>>;
        destination: flags.Discriminated<flags.Option<string>>;
    };
    run(): Promise<void>;
}
