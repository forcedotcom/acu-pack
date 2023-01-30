import { SfdxCommand } from '@salesforce/command';
import { Messages, Connection, SfdxError } from '@salesforce/core';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

export abstract class CommandBase extends SfdxCommand {
  // Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
  // or any library that is using the messages framework can also be loaded this way.
  public static messages = Messages.loadMessages('@salesforce/acu-pack', 'acu-pack');
  public static args = [{ name: 'file' }];
  
  protected get orgAlias(): string {
    this.logger.debug('Start orgAlias');
    if(this.flags.targetusername) {
      return this.flags.targetusername as string;
    }
    if(this.org && this.org.getUsername()) {
      return this.org.getUsername()
    }
    return null;
  }
  protected get orgId(): string {
    this.logger.debug('Start orgId');
    return this.org.getOrgId();
  }
  protected get connection(): Connection {
    this.logger.debug('Start connection');
    return this.org.getConnection();
  }

  protected gotError = false;

  public async run(): Promise<void> {
    this.logger.debug('Start run');
    try {
      if(this.orgAlias) {
        this.ux.log(`Connected to Org: ${this.orgAlias}(${this.orgId})`);
      }
      this.logger.debug('Start runInternal');
      await this.runInternal();
      this.logger.debug('End runInternal');
    } catch (err) {
      await this.errorHandler(err);
    } finally {
      this.ux.log('Done.');
      process.exitCode = this.gotError ? 1 : 0;    
    }
  }
  protected async errorHandler(err: Error, throwErr = false): Promise<void> {
    this.logger.debug('Start errorHandler');
    this.gotError = true;
    if(err instanceof Error) {
      this.ux.error(`Error: ${err.message}`)
      this.logger.error(err.stack);
    } else {
      const message = JSON.stringify(err);
      this.ux.error(`Error: ${message}`)
      this.logger.error(message);
    }
    
    if(throwErr) {
      this.logger.debug('Throwing error.');
      throw err;
    }
    return Promise.resolve();
  }

  protected raiseError(message: string): void {
    throw new SfdxError(message);
  }
  
  protected abstract runInternal(): Promise<void>;
}
