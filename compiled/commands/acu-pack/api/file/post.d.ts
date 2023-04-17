import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
export default class post extends CommandBase {
    static readonly: any;
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        metadata: flags.Discriminated<flags.String>;
        records: flags.Discriminated<flags.String>;
        columns: flags.Discriminated<flags.String>;
        allornothing: flags.Discriminated<flags.Boolean<boolean>>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    protected metadataInfo: any;
    protected runInternal(): Promise<void>;
    protected postObject(objectName: string, objectRecord: any, filePath: string): Promise<any>;
    private sanitizeRecord;
}
