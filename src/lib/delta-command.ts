import { flags, FlagsConfig } from '@salesforce/command';
import { CommandBase } from './command-base';
import { DeltaOptions } from './delta-provider';

export abstract class DeltaCommandBase extends CommandBase {
  public static defaultCopyDirList: string[] = ['aura', 'lwc', 'experiences'];

  public static getFlagsConfig(flagsConfig: FlagsConfig): any {
    if (!flagsConfig) {
      flagsConfig = {};
    }
    if (!flagsConfig.source) {
      flagsConfig.source = flags.filepath({
        char: 's',
        required: true,
        description: CommandBase.messages.getMessage('source.delta.sourceFlagDescription')
      });
    }
    if (!flagsConfig.destination) {
      flagsConfig.destination = flags.filepath({
        char: 'd',
        description: CommandBase.messages.getMessage('source.delta.destinationFlagDescription')
      });
    }
    if (!flagsConfig.force) {
      flagsConfig.force = flags.filepath({
        char: 'f',
        description: CommandBase.messages.getMessage('source.delta.forceFlagDescription')
      });
    }
    if (!flagsConfig.ignore) {
      flagsConfig.ignore = flags.filepath({
        char: 'i',
        description: CommandBase.messages.getMessage('source.delta.ignoreFlagDescription')
      });
    }
    if (!flagsConfig.deletereport) {
      flagsConfig.deletereport = flags.filepath({
        char: 'r',
        description: CommandBase.messages.getMessage('source.delta.deleteReportFlagDescription')
      });
    }
    if (!flagsConfig.check) {
      flagsConfig.check = flags.boolean({
        char: 'c',
        description: CommandBase.messages.getMessage('source.delta.checkFlagDescription')
      });
    }
    if (!flagsConfig.copyfulldir) {
      flagsConfig.copyfulldir = flags.string({
        char: 'a',
        description: CommandBase.messages.getMessage('source.delta.copyFullDirFlagDescription', [DeltaCommandBase.defaultCopyDirList.join()])
      });
    }
    return flagsConfig;
  }

  public static getDeltaOptions(commandFlags: FlagsConfig): DeltaOptions {
      const deltaOptions = new DeltaOptions();
      if (!commandFlags) {
        return deltaOptions;
      }
      deltaOptions.deltaFilePath = (commandFlags.deltaFilePath as unknown as string) ?? null;
      deltaOptions.source = (commandFlags.source as unknown as string) ?? null;
      deltaOptions.destination = (commandFlags.destination as unknown as string) ?? null;
      deltaOptions.forceFile = (commandFlags.force as unknown as string) ?? null;
      deltaOptions.ignoreFile = (commandFlags.ignore as unknown as string) ?? null;
      if(commandFlags.copyfulldir) {
        deltaOptions.fullCopyDirNames = (commandFlags.copyfulldir as unknown as string).split(',');
      } else {
        deltaOptions.fullCopyDirNames = DeltaCommandBase.defaultCopyDirList;
      }
      
      return deltaOptions;
  }
}
