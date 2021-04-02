"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_base_1 = require("./command-base");
const command_1 = require("@salesforce/command");
class DeltaCommandBase extends command_base_1.CommandBase {
    static getFlagsConfig(flagsConfig) {
        if (!flagsConfig) {
            flagsConfig = {};
        }
        if (!flagsConfig.source) {
            flagsConfig.source = command_1.flags.filepath({
                char: 's',
                required: true,
                description: command_base_1.CommandBase.messages.getMessage('source.delta.sourceFlagDescription')
            });
        }
        if (!flagsConfig.destination) {
            flagsConfig.destination = command_1.flags.filepath({
                char: 'd',
                description: command_base_1.CommandBase.messages.getMessage('source.delta.destinationFlagDescription')
            });
        }
        if (!flagsConfig.force) {
            flagsConfig.force = command_1.flags.filepath({
                char: 'f',
                description: command_base_1.CommandBase.messages.getMessage('source.delta.forceFlagDescription')
            });
        }
        if (!flagsConfig.ignore) {
            flagsConfig.ignore = command_1.flags.filepath({
                char: 'i',
                description: command_base_1.CommandBase.messages.getMessage('source.delta.ignoreFlagDescription')
            });
        }
        if (!flagsConfig.deletereport) {
            flagsConfig.deletereport = command_1.flags.filepath({
                char: 'r',
                description: command_base_1.CommandBase.messages.getMessage('source.delta.deleteReportFlagDescription')
            });
        }
        if (!flagsConfig.check) {
            flagsConfig.check = command_1.flags.boolean({
                char: 'c',
                description: command_base_1.CommandBase.messages.getMessage('source.delta.checkFlagDescription')
            });
        }
        return flagsConfig;
    }
}
exports.DeltaCommandBase = DeltaCommandBase;
//# sourceMappingURL=delta-command.js.map