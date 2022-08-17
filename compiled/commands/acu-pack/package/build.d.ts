import { OutputFlags } from '@oclif/parser';
import { flags, UX } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
import { PackageOptions } from '../../../lib/package-options';
export default class Build extends CommandBase {
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        package: flags.Discriminated<flags.String>;
        metadata: flags.Discriminated<flags.String>;
        options: flags.Discriminated<flags.String>;
        namespaces: flags.Discriminated<flags.String>;
        source: flags.Discriminated<flags.Boolean<boolean>>;
        folder: flags.Discriminated<flags.String>;
        append: flags.Discriminated<flags.Boolean<boolean>>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    static getMetadataMapFromOrg(orgAlias: string, ux: UX, options: PackageOptions, cmdFlags: OutputFlags<any>): Promise<Map<string, string[]>>;
    static getMetadataMapFromFolder(folder: string, ux: UX, options: PackageOptions): Promise<Map<string, string[]>>;
    protected static getMDAPIFiles(xmlName: string, folder: string, isDocument?: boolean): AsyncGenerator<string, void, void>;
    protected runInternal(): Promise<void>;
}
