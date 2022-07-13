import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
export default class Build extends CommandBase {
    static description: string;
    static defaultPackageFileName: string;
    static examples: string[];
    protected static flagsConfig: {
        package: flags.Discriminated<flags.String>;
        metadata: flags.Discriminated<flags.String>;
        options: flags.Discriminated<flags.String>;
        namespaces: flags.Discriminated<flags.String>;
        source: flags.Discriminated<flags.Boolean<boolean>>;
        append: flags.Discriminated<flags.Boolean<boolean>>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    protected runInternal(): Promise<void>;
}
