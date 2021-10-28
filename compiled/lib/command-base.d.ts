import { SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
export declare abstract class CommandBase extends SfdxCommand {
    static messages: Messages;
    static args: {
        name: string;
    }[];
    get orgAlias(): string;
    get orgId(): string;
    get connection(): any;
}
