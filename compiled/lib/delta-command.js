"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeltaCommandBase = void 0;
const command_1 = require("@salesforce/command");
const command_base_1 = require("./command-base");
const delta_provider_1 = require("./delta-provider");
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
        if (!flagsConfig.copyfulldir) {
            flagsConfig.copyfulldir = command_1.flags.string({
                char: 'a',
                description: command_base_1.CommandBase.messages.getMessage('source.delta.copyFullDirFlagDescription', [DeltaCommandBase.defaultCopyDirList.join()])
            });
        }
        return flagsConfig;
    }
    static getDeltaOptions(commandFlags) {
        var _a, _b, _c, _d, _e;
        const deltaOptions = new delta_provider_1.DeltaOptions();
        if (!commandFlags) {
            return deltaOptions;
        }
        deltaOptions.deltaFilePath = (_a = commandFlags.deltaFilePath) !== null && _a !== void 0 ? _a : null;
        deltaOptions.source = (_b = commandFlags.source) !== null && _b !== void 0 ? _b : null;
        deltaOptions.destination = (_c = commandFlags.destination) !== null && _c !== void 0 ? _c : null;
        deltaOptions.forceFile = (_d = commandFlags.force) !== null && _d !== void 0 ? _d : null;
        deltaOptions.ignoreFile = (_e = commandFlags.ignore) !== null && _e !== void 0 ? _e : null;
        if (commandFlags.copyfulldir) {
            deltaOptions.fullCopyDirNames = commandFlags.copyfulldir.split(',');
        }
        else {
            deltaOptions.fullCopyDirNames = DeltaCommandBase.defaultCopyDirList;
        }
        return deltaOptions;
    }
}
exports.DeltaCommandBase = DeltaCommandBase;
DeltaCommandBase.defaultCopyDirList = ['aura', 'lwc', 'experiences'];
//# sourceMappingURL=delta-command.js.map