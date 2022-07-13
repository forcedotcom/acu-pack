import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
import SchemaOptions from '../../../lib/schema-options';
export default class Dictionary extends CommandBase {
    static description: string;
    static defaultReportPath: string;
    static examples: string[];
    protected static flagsConfig: {
        report: flags.Discriminated<flags.String>;
        namespaces: flags.Discriminated<flags.String>;
        options: flags.Discriminated<flags.String>;
    };
    protected static requiresUsername: boolean;
    protected options: SchemaOptions;
    protected runInternal(): Promise<void>;
    private getColumnRow;
    private getSortedTypeNames;
    private entityDefinitionValues;
}
