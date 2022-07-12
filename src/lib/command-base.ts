import { SfdxCommand } from '@salesforce/command';
import { Messages, Connection } from '@salesforce/core';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

export abstract class CommandBase extends SfdxCommand {
  // Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
  // or any library that is using the messages framework can also be loaded this way.
  public static messages = Messages.loadMessages('@acumensolutions/acu-pack', 'acumen');
  public static args = [{ name: 'file' }];
  
  protected get orgAlias(): string {
    if(this.flags.targetusername) {
      return this.flags.targetusername as string;
    }
    if(this.org && this.org.getUsername()) {
      return this.org.getUsername()
    }
    return null;
  }
  protected get orgId(): string {
    return this.org.getOrgId();
  }
  protected get connection(): Connection {
    return this.org.getConnection();
  }

  public async run(): Promise<void> {
    try {
      if(this.orgAlias) {
        this.ux.log(`Connecting to Org: ${this.orgAlias}(${this.orgId})`);
      }
      await this.runInternal();
    } catch (err) {
      await this.handlerError(err);
    } finally {
      this.ux.log('Done.');
    }
  }
  protected async handlerError(err: Error, throwErr = false): Promise<void> {
    process.exitCode = 1;
    await Promise.resolve(this.ux.log(`An error occurred: ${err.message}`));
    if(throwErr) {
      throw err;
    }
  }
  
  protected abstract runInternal(): Promise<void>;
}
