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
    protected gotError: boolean;
    run(): Promise<void>;
    protected errorHandler(err: Error, throwErr?: boolean): Promise<void>;
    protected raiseError(message: string): void;
    protected abstract runInternal(): Promise<void>;
}
