import { CommandBase } from './command-base';
import { flags } from '@salesforce/command';
import { DeltaOptions } from './delta-provider';

export abstract class DeltaCommandBase extends CommandBase {
  public static defaultCopyDirList: string[] = ['aura', 'lwc', 'experience'];

  public static getFlagsConfig(flagsConfig: any): any {
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

  public static getDeltaOptions(commandFlags: any): DeltaOptions {
      const deltaOptions = new DeltaOptions();
      if (!commandFlags) {
        return deltaOptions;
      }
      deltaOptions.deltaFilePath = commandFlags?.deltaFilePath ?? null;
      deltaOptions.source = commandFlags?.source ?? null;
      deltaOptions.destination = commandFlags?.destination ?? null;
      deltaOptions.forceFile = commandFlags?.force ?? null;
      deltaOptions.ignoreFile = commandFlags?.ignore ?? null;
      deltaOptions.fullCopyDirNames = commandFlags.copyfulldir?.split(',') ?? DeltaCommandBase.defaultCopyDirList;
      return deltaOptions;
  }
}
