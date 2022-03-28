"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const deltaOptions = new delta_provider_1.DeltaOptions();
        if (!commandFlags) {
            return deltaOptions;
        }
        deltaOptions.deltaFilePath = (_b = (_a = commandFlags) === null || _a === void 0 ? void 0 : _a.deltaFilePath, (_b !== null && _b !== void 0 ? _b : null));
        deltaOptions.source = (_d = (_c = commandFlags) === null || _c === void 0 ? void 0 : _c.source, (_d !== null && _d !== void 0 ? _d : null));
        deltaOptions.destination = (_f = (_e = commandFlags) === null || _e === void 0 ? void 0 : _e.destination, (_f !== null && _f !== void 0 ? _f : null));
        deltaOptions.forceFile = (_h = (_g = commandFlags) === null || _g === void 0 ? void 0 : _g.force, (_h !== null && _h !== void 0 ? _h : null));
        deltaOptions.ignoreFile = (_k = (_j = commandFlags) === null || _j === void 0 ? void 0 : _j.ignore, (_k !== null && _k !== void 0 ? _k : null));
        deltaOptions.fullCopyDirNames = (_m = (_l = commandFlags.copyfulldir) === null || _l === void 0 ? void 0 : _l.split(','), (_m !== null && _m !== void 0 ? _m : DeltaCommandBase.defaultCopyDirList));
        return deltaOptions;
    }
}
exports.DeltaCommandBase = DeltaCommandBase;
DeltaCommandBase.defaultCopyDirList = ['aura', 'lwc', 'experience'];
//# sourceMappingURL=delta-command.js.map