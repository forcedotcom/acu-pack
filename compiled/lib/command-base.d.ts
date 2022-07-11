import { SfdxCommand } from '@salesforce/command';
import { Messages, Connection } from '@salesforce/core';
export declare abstract class CommandBase extends SfdxCommand {
    static messages: Messages;
    static args: {
        name: string;
    }[];
    protected get orgAlias(): string;
    protected get orgId(): string;
    protected get connection(): Connection;
    run(): Promise<void>;
    protected handlerError(err: Error, throwErr?: boolean): Promise<void>;
    protected abstract runInternal(): Promise<void>;
}
