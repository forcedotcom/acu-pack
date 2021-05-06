import { SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

export abstract class CommandBase extends SfdxCommand {
  // Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
  // or any library that is using the messages framework can also be loaded this way.
  public static messages = Messages.loadMessages('@acumensolutions/acu-pack', 'acumen');
  public static args = [{ name: 'file' }];
  get orgAlias(): string {
    return this.flags.targetusername ?? this.org.getUsername();
  }
  get orgId(): string {
    return this.org.getOrgId();
  }
  get connection(): any {
    return this.org.getConnection();
  }
}
