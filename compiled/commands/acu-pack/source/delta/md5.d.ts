import { CommandBase } from '../../../../lib/command-base';
import { Delta } from '../../../../lib/delta-provider';
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
            diff(source: string): AsyncGenerator<Delta, any, any>;
            logFile: string;
            deltaOptions: import("../../../../lib/delta-options").DeltaOptions;
            run(deltaOptions: import("../../../../lib/delta-options").DeltaOptions): Promise<any>;
            loadDeltaFile(deltaFilePath?: string): Promise<void>;
            logMessage(message: string, includeConsole?: boolean): Promise<void>;
            validateDeltaOptions(deltaOptions: import("../../../../lib/delta-options").DeltaOptions): Promise<string>;
        };
        deltaTypeKind: {
            NONE: string;
            A: string;
            M: string;
            D: string;
        };
        isFullCopyPath(filePath: string, deltaOptions: import("../../../../lib/delta-options").DeltaOptions): boolean;
        getFullCopyPath(filePath: string, deltaOptions: import("../../../../lib/delta-options").DeltaOptions): string;
    };
    protected static flagsConfig: any;
    protected name: string;
    protected deltas: Map<string, any>;
    protected runInternal(): Promise<void>;
}
