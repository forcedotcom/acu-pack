import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
import { PermissionSet } from '../../../lib/sfdx-permission';
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
    protected static requiresProject: boolean;
    protected static requiresUsername: boolean;
    protected permissions: Map<string, PermissionSet>;
    protected runInternal(): Promise<void>;
}
