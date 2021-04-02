import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
export default class Clear extends CommandBase {
    static defaultJobStatusWaitMax: number;
    static description: string;
    static defaultMetadataTypes: string[];
    static examples: string[];
    protected static flagsConfig: {
        metadatas: flags.Discriminated<flags.Option<string>>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    run(): Promise<void>;
}
