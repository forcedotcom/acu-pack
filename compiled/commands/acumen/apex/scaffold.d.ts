import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
export default class Scaffold extends CommandBase {
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        sobjects: flags.Discriminated<flags.Option<string>>;
        options: flags.Discriminated<flags.Option<string>>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    private static META_XML;
    private OrgAlias;
    private Schemas;
    run(): Promise<void>;
    private getSchema;
    private generateTestSetupCode;
    private generateFieldValue;
}
