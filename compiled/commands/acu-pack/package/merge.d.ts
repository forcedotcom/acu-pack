import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
export default class Merge extends CommandBase {
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        source: flags.Discriminated<flags.String>;
        destination: flags.Discriminated<flags.String>;
        compare: flags.Discriminated<flags.Boolean<boolean>>;
    };
    protected runInternal(): Promise<void>;
}
