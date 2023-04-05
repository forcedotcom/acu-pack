import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
export default class post extends CommandBase {
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        records: flags.Discriminated<flags.String>;
        folder: flags.Discriminated<flags.String>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    protected runInternal(): Promise<void>;
    private sanitizeContentVersion;
}
