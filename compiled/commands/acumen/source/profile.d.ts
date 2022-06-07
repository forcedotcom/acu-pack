import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
export default class Profile extends CommandBase {
    static defaultSourceFolder: string;
    static defaultPermissionsGlobs: string[];
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        source: flags.Discriminated<flags.String>;
        modify: flags.Discriminated<flags.Boolean<boolean>>;
        output: flags.Discriminated<flags.String>;
    };
    run(): Promise<void>;
}
