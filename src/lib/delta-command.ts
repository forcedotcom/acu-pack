import { CommandBase } from './command-base';
import { flags } from '@salesforce/command';

export abstract class DeltaCommandBase extends CommandBase {
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
    return flagsConfig;

  }
}
