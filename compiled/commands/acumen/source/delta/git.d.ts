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
            diffAsync(source?: string): AsyncGenerator<Delta, any, any>;
            validateDeltaOptionsAsync(deltaOptions: DeltaOptions): Promise<string>;
            logFile: string;
            deltaOptions: DeltaOptions;
            getFlagsConfig(flagsConfig: any): any;
            run(deltaOptions: DeltaOptions): Promise<void>;
            loadDeltaFileAsync(deltaFilePath?: string): Promise<void>;
            logMessage(message: string, includeConsole?: boolean): Promise<void>;
        };
        deltaTypeKind: {
            NONE: string;
            A: string;
            M: string;
            D: string;
        };
    };
    protected static flagsConfig: any;
    protected name: string;
    protected deltas: Map<string, string>;
    run(): Promise<any>;
}
