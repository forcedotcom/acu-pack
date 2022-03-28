import { CommandBase } from './command-base';
import { DeltaOptions } from './delta-provider';
export declare abstract class DeltaCommandBase extends CommandBase {
    static defaultCopyDirList: string[];
    static getFlagsConfig(flagsConfig: any): any;
    static getDeltaOptions(commandFlags: any): DeltaOptions;
}
