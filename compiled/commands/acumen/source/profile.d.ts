import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
import { PermissionSet } from '../../../lib/sfdx-permission';
export default class Profile extends CommandBase {
    static defaultSourceFolder: string;
    static defaultPermissionsGlobs: string[];
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        source: flags.Discriminated<flags.Option<string>>;
        modify: flags.Discriminated<flags.Boolean<boolean>>;
        output: flags.Discriminated<flags.Option<string>>;
    };
    protected static requiresProject: boolean;
    protected static requiresUsername: boolean;
    protected permissions: Map<string, PermissionSet>;
    run(): Promise<void>;
    protected getErrors(typeNames: Iterable<string>, permissionNames: Iterable<string>): string[];
}
