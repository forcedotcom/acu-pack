import { FlagsConfig } from '@salesforce/command';
import { CommandBase } from './command-base';
import { DeltaOptions } from './delta-provider';
export declare abstract class DeltaCommandBase extends CommandBase {
    static defaultCopyDirList: string[];
    static getFlagsConfig(flagsConfig: FlagsConfig): any;
    static getDeltaOptions(commandFlags: FlagsConfig): DeltaOptions;
}
