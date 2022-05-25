import { CommandBase } from '../../../lib/command-base';
import { flags } from '@salesforce/command';
import SchemaOptions from '../../../lib/schema-options';
export default class Dictionary extends CommandBase {
    static description: string;
    static defaultReportPath: string;
    static examples: string[];
    protected static flagsConfig: {
        report: flags.Discriminated<flags.Option<string>>;
        namespaces: flags.Discriminated<flags.Option<string>>;
        options: flags.Discriminated<flags.Option<string>>;
    };
    protected static requiresUsername: boolean;
    protected options: SchemaOptions;
    run(): Promise<void>;
    private getColumnRow;
    private getSortedTypeNames;
    private entityDefinitionValues;
}
