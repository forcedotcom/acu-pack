import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
export default class Build extends CommandBase {
    static description: string;
    static defaultPackageFileName: string;
    static examples: string[];
    protected static flagsConfig: {
        package: flags.Discriminated<flags.Option<string>>;
        metadata: flags.Discriminated<flags.Option<string>>;
        options: flags.Discriminated<flags.Option<string>>;
        namespaces: flags.Discriminated<flags.Option<string>>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    run(): Promise<void>;
}
