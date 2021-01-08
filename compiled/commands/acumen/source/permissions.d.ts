import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
import { ObjectDetail, FieldDetail, PermissionSet, MetadataDetail } from '../../../lib/sfdx-permission';
export default class Permissions extends CommandBase {
    static defaultSourceFolder: string;
    static defaultReportPath: string;
    static defaultMetadataFolders: string[];
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        source: flags.Discriminated<flags.Option<string>>;
        report: flags.Discriminated<flags.Option<string>>;
        folders: flags.Discriminated<flags.Option<string>>;
    };
    protected static requiresProject: boolean;
    protected defaultReportHeaderName: string;
    protected objectMetadata: Map<string, ObjectDetail>;
    protected fieldMetadata: Map<string, FieldDetail>;
    protected permissions: Map<string, PermissionSet>;
    protected reportHeaders: string[];
    run(): Promise<void>;
    protected buildSheet(permCollectionPropertyName: string, metadataDetails?: Map<string, MetadataDetail>): string[][];
    protected getObjectDetails(name: string): ObjectDetail;
    protected getFieldDetails(name: string): FieldDetail;
    protected processObjectMeta(filePath: string, json: any): void;
    protected processFieldMeta(filePath: string, json: any): void;
    protected processPermissionSetMeta(filePath: string, json: any): void;
}
