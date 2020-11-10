import { CommandBase } from '../../../../lib/command-base';
import { DeltaOptions, Delta } from '../../../../lib/delta-provider';
export default class Md5 extends CommandBase {
    static description: string;
    static examples: string[];
    static md5DeltaProvider: {
        new (): {
            deltaLineToken: string;
            name: string;
            deltas: Map<string, any>;
            processDeltaLine(deltaLine: string): void;
            getMessage(name: string): string;
            diffAsync(source: string): AsyncGenerator<Delta, any, any>;
            logFile: string;
            deltaOptions: DeltaOptions;
            getFlagsConfig(flagsConfig: any): any;
            run(deltaOptions: DeltaOptions): Promise<void>;
            loadDeltaFileAsync(deltaFilePath?: string): Promise<void>;
            logMessage(message: string, includeConsole?: boolean): Promise<void>;
            validateDeltaOptionsAsync(deltaOptions: DeltaOptions): Promise<string>;
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
    protected deltas: Map<string, any>;
    run(): Promise<any>;
}
