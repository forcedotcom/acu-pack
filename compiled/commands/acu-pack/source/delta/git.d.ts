import { CommandBase } from '../../../../lib/command-base';
import { Delta } from '../../../../lib/delta-provider';
import { DeltaOptions } from '../../../../lib/delta-options';
export default class Git extends CommandBase {
    static description: string;
    static examples: string[];
    static gitDeltaProvider: {
        new (): {
            name: string;
            deltaLineToken: string;
            deltas: Map<string, any>;
            processDeltaLine(deltaLine: string): void;
            getMessage(name: string): string;
            diff(source?: string): AsyncGenerator<Delta, any, any>;
            validateDeltaOptions(deltaOptions: DeltaOptions): Promise<string>;
            logFile: string;
            deltaOptions: DeltaOptions;
            run(deltaOptions: DeltaOptions): Promise<any>;
            loadDeltaFile(deltaFilePath?: string): Promise<void>;
            logMessage(message: string, includeConsole?: boolean): Promise<void>;
        };
        deltaTypeKind: {
            NONE: string;
            A: string;
            M: string;
            D: string;
        };
        getFullCopyPath(filePath: string, fullCopyDirNames: string[]): string;
    };
    protected static flagsConfig: any;
    protected name: string;
    protected deltas: Map<string, string>;
    protected runInternal(): Promise<void>;
}
