export declare class Delta {
    deltaKind: string;
    deltaFile: string;
    constructor(deltaKind: string, deltaFile: string);
}
export declare class DeltaOptions {
    deltaFilePath: string;
    source: string;
    destination: string;
    deleteReportFile: string;
    forceFile: string;
    ignoreFile: string;
    isDryRun: boolean;
    normalize(): void;
}
export declare abstract class DeltaProvider {
    static deltaTypeKind: {
        NONE: string;
        A: string;
        M: string;
        D: string;
    };
    logFile: string;
    deltaOptions: DeltaOptions;
    abstract name: string;
    abstract deltaLineToken: string;
    abstract deltas: Map<string, any>;
    abstract processDeltaLine(deltaLine: string): void;
    abstract getMessage(name: string): string;
    abstract diff(source: string): AsyncGenerator<Delta, any, any>;
    run(deltaOptions: DeltaOptions): Promise<any>;
    loadDeltaFile(deltaFilePath?: string): Promise<void>;
    logMessage(message: string, includeConsole?: boolean): Promise<void>;
    validateDeltaOptions(deltaOptions: DeltaOptions): Promise<string>;
}
