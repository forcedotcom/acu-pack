"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
// Initialize Messages with the current plugin directory
core_1.Messages.importMessagesDirectory(__dirname);
class CommandBase extends command_1.SfdxCommand {
}
exports.CommandBase = CommandBase;
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
CommandBase.messages = core_1.Messages.loadMessages('@acumensolutions/acu-pack', 'acumen');
CommandBase.args = [{ name: 'file' }];
//# sourceMappingURL=command-base.js.map