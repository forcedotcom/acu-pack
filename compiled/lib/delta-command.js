"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeltaCommandBase = void 0;
const command_1 = require("@salesforce/command");
const command_base_1 = require("./command-base");
const delta_options_1 = require("./delta-options");
const options_factory_1 = require("./options-factory");
class DeltaCommandBase extends command_base_1.CommandBase {
    static getFlagsConfig(flagsConfig) {
        if (!flagsConfig) {
            flagsConfig = {};
        }
        if (!flagsConfig.options) {
            flagsConfig.options = command_1.flags.filepath({
                char: 'o',
                description: command_base_1.CommandBase.messages.getMessage('source.delta.optionsFlagDescription')
            });
        }
        if (!flagsConfig.source) {
            flagsConfig.source = command_1.flags.filepath({
                char: 's',
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
        if (!flagsConfig.copyfulldir) {
            flagsConfig.copyfulldir = command_1.flags.string({
                char: 'a',
                description: command_base_1.CommandBase.messages.getMessage('source.delta.copyFullDirFlagDescription', [DeltaCommandBase.defaultCopyDirList.join()])
            });
        }
        return flagsConfig;
    }
    static async getDeltaOptions(commandFlags) {
        let deltaOptions = new delta_options_1.DeltaOptions();
        if (!commandFlags) {
            return deltaOptions;
        }
        // Read/Write the options file if it does not exist already
        if (commandFlags.options) {
            deltaOptions = await options_factory_1.OptionsFactory.get(delta_options_1.DeltaOptions, commandFlags.options);
        }
        else {
            deltaOptions.deltaFilePath = commandFlags.deltaFilePath ?? null;
            deltaOptions.source = commandFlags.source ?? null;
            deltaOptions.destination = commandFlags.destination ?? null;
            deltaOptions.forceFile = commandFlags.force ?? null;
            deltaOptions.ignoreFile = commandFlags.ignore ?? null;
            if (commandFlags.copyfulldir) {
                deltaOptions.fullCopyDirNames = commandFlags.copyfulldir.split(',');
            }
            else {
                deltaOptions.fullCopyDirNames = DeltaCommandBase.defaultCopyDirList;
            }
        }
        return deltaOptions;
    }
}
exports.DeltaCommandBase = DeltaCommandBase;
DeltaCommandBase.defaultCopyDirList = ['aura', 'lwc', 'experiences', 'staticresources', 'territory2Models', 'waveTemplates'];
//# sourceMappingURL=delta-command.js.map