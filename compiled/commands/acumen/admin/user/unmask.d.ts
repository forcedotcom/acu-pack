import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
export default class Unmask extends CommandBase {
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        userlist: flags.Discriminated<flags.Option<string>>;
        userfile: flags.Discriminated<flags.Option<string>>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    run(): Promise<void>;
}
