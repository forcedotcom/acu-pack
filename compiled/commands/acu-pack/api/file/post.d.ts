import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
export default class post extends CommandBase {
    static readonly metaDataInfo: {
        ContentVersion: {
            MetaName: string;
            DataName: string;
            Filename: string;
        };
        Document: {
            MetaName: string;
            DataName: string;
            Filename: string;
        };
        Attachment: {
            MetaName: string;
            DataName: string;
            Filename: string;
        };
    };
    static readonly: any;
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        metadata: flags.Discriminated<flags.String>;
        records: flags.Discriminated<flags.String>;
        columns: flags.Discriminated<flags.String>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    protected metadataInfo: any;
    protected runInternal(): Promise<void>;
    protected postObject(objectName: string, objectRecord: any, filePath: string): Promise<any>;
    protected postObjectMultipart(objectName: string, objectRecord: any, fileName: string, filePath: string): Promise<any>;
    private sanitizeRecord;
}
