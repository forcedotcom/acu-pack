"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandBase = void 0;
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
// Initialize Messages with the current plugin directory
core_1.Messages.importMessagesDirectory(__dirname);
class CommandBase extends command_1.SfdxCommand {
    constructor() {
        super(...arguments);
        this.gotError = false;
    }
    get orgAlias() {
        this.logger.debug('Start orgAlias');
        if (this.flags.targetusername) {
            return this.flags.targetusername;
        }
        if (this.org && this.org.getUsername()) {
            return this.org.getUsername();
        }
        return null;
    }
    get orgId() {
        this.logger.debug('Start orgId');
        return this.org.getOrgId();
    }
    get connection() {
        this.logger.debug('Start connection');
        return this.org.getConnection();
    }
    async run() {
        this.logger.debug('Start run');
        try {
            if (this.orgAlias) {
                this.ux.log(`Connected to Org: ${this.orgAlias}(${this.orgId})`);
            }
            this.logger.debug('Start runInternal');
            await this.runInternal();
            this.logger.debug('End runInternal');
        }
        catch (err) {
            await this.errorHandler(err);
        }
        finally {
            this.ux.log('Done.');
            process.exitCode = this.gotError ? 1 : 0;
        }
    }
    async errorHandler(err, throwErr = false) {
        this.logger.debug('Start errorHandler');
        this.gotError = true;
        if (err instanceof Error) {
            this.ux.error(`Error: ${err.message}`);
            this.logger.error(err.stack);
        }
        else {
            const message = JSON.stringify(err);
            this.ux.error(`Error: ${message}`);
            this.logger.error(message);
        }
        if (throwErr) {
            this.logger.debug('Throwing error.');
            throw err;
        }
        return Promise.resolve();
    }
    raiseError(message) {
        throw new core_1.SfdxError(message);
    }
}
exports.CommandBase = CommandBase;
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
CommandBase.messages = core_1.Messages.loadMessages('acu-pack', 'acu-pack');
CommandBase.args = [{ name: 'file' }];
//# sourceMappingURL=command-base.js.map