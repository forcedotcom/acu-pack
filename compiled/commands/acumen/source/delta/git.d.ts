import { CommandBase } from '../../../../lib/command-base';
import { DeltaOptions, Delta } from '../../../../lib/delta-provider';
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
        isFullCopyPath(filePath: string, deltaOptions: DeltaOptions): boolean;
    };
    protected static flagsConfig: any;
    protected name: string;
    protected deltas: Map<string, string>;
    run(): Promise<any>;
}
