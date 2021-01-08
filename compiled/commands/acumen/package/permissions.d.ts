import { CommandBase } from '../../../lib/command-base';
import { flags } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
export default class Permissions extends CommandBase {
    static packageFileName: string;
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        package: flags.Discriminated<flags.Option<string>>;
        metadata: flags.Discriminated<flags.Option<string>>;
        namespaces: flags.Discriminated<flags.Option<string>>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    protected metaNames: Set<string>;
    protected namespaces: Set<string>;
    protected orgId: string;
    protected packageFileName: string;
    run(): Promise<AnyJson>;
    protected logAsync(...args: string[]): Promise<void>;
}
