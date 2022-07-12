"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandBase = void 0;
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
// Initialize Messages with the current plugin directory
core_1.Messages.importMessagesDirectory(__dirname);
class CommandBase extends command_1.SfdxCommand {
    get orgAlias() {
        if (this.flags.targetusername) {
            return this.flags.targetusername;
        }
        if (this.org && this.org.getUsername()) {
            return this.org.getUsername();
        }
        return null;
    }
    get orgId() {
        return this.org.getOrgId();
    }
    get connection() {
        return this.org.getConnection();
    }
    async run() {
        try {
            if (this.orgAlias) {
                this.ux.log(`Connecting to Org: ${this.orgAlias}(${this.orgId})`);
            }
            await this.runInternal();
        }
        catch (err) {
            await this.handlerError(err);
        }
        finally {
            this.ux.log('Done.');
        }
    }
    async handlerError(err, throwErr = false) {
        process.exitCode = 1;
        if (err instanceof Error) {
            this.ux.log(`An error occurred: ${err.stack}`);
        }
        else {
            this.ux.log(`An error occurred: ${JSON.stringify(err)}`);
        }
        if (throwErr) {
            throw err;
        }
        return Promise.resolve();
    }
}
exports.CommandBase = CommandBase;
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
CommandBase.messages = core_1.Messages.loadMessages('@acumensolutions/acu-pack', 'acumen');
CommandBase.args = [{ name: 'file' }];
//# sourceMappingURL=command-base.js.map