import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
export default class Scaffold extends CommandBase {
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        sobjects: flags.Discriminated<flags.String>;
        options: flags.Discriminated<flags.String>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    private static META_XML;
    private static MAX_CLASS_NAME_LENGTH;
    private schemas;
    private index;
    protected runInternal(): Promise<void>;
    private getSchema;
    private generateTestSetupCode;
    private generateFieldValue;
}
