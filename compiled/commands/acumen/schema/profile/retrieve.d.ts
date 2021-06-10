import { CommandBase } from '../../../../lib/command-base';
import { flags } from '@salesforce/command';
export default class ProfileRetrieve extends CommandBase {
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        names: flags.Discriminated<flags.Array<string>>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    run(): Promise<void>;
}
