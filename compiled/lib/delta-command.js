"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeltaCommandBase = void 0;
const command_base_1 = require("./command-base");
const command_1 = require("@salesforce/command");
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
        var _a, _b, _c, _d, _e, _f, _g;
        const deltaOptions = new delta_provider_1.DeltaOptions();
        if (!commandFlags) {
            return deltaOptions;
        }
        deltaOptions.deltaFilePath = (_a = commandFlags === null || commandFlags === void 0 ? void 0 : commandFlags.deltaFilePath) !== null && _a !== void 0 ? _a : null;
        deltaOptions.source = (_b = commandFlags === null || commandFlags === void 0 ? void 0 : commandFlags.source) !== null && _b !== void 0 ? _b : null;
        deltaOptions.destination = (_c = commandFlags === null || commandFlags === void 0 ? void 0 : commandFlags.destination) !== null && _c !== void 0 ? _c : null;
        deltaOptions.forceFile = (_d = commandFlags === null || commandFlags === void 0 ? void 0 : commandFlags.force) !== null && _d !== void 0 ? _d : null;
        deltaOptions.ignoreFile = (_e = commandFlags === null || commandFlags === void 0 ? void 0 : commandFlags.ignore) !== null && _e !== void 0 ? _e : null;
        deltaOptions.fullCopyDirNames = (_g = (_f = commandFlags.copyfulldir) === null || _f === void 0 ? void 0 : _f.split(',')) !== null && _g !== void 0 ? _g : DeltaCommandBase.defaultCopyDirList;
        return deltaOptions;
    }
}
exports.DeltaCommandBase = DeltaCommandBase;
DeltaCommandBase.defaultCopyDirList = ['aura', 'lwc', 'experience'];
//# sourceMappingURL=delta-command.js.map