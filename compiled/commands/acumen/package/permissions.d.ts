import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
export default class Permissions extends CommandBase {
    static packageFileName: string;
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        package: flags.Discriminated<flags.String>;
        metadata: flags.Discriminated<flags.String>;
        namespaces: flags.Discriminated<flags.String>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    protected metaNames: Set<string>;
    protected namespaces: Set<string>;
    protected packageFileName: string;
    protected runInternal(): Promise<void>;
}
