import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
export default class post extends CommandBase {
    static readonly formDataInfo: {
        ContentVersion: {
            MetaName: string;
            DataName: string;
        };
        Document: {
            MetaName: string;
            DataName: string;
        };
    };
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        records: flags.Discriminated<flags.String>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    protected runInternal(): Promise<void>;
    protected postObject(objectName: string, objectRecord: any, filePath: string): Promise<any>;
    protected postObjectMultipart(objectName: string, objectRecord: any, fileName: string, filePath: string): Promise<any>;
    private sanitizeContentVersion;
}
