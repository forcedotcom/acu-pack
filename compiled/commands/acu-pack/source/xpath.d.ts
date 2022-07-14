import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
export default class XPath extends CommandBase {
    static description: string;
    static defaultOptionsFileName: string;
    static examples: string[];
    protected static flagsConfig: {
        options: flags.Discriminated<flags.String>;
    };
    protected runInternal(): Promise<void>;
}
