import { OptionsBase } from './options';
export declare class DeltaOptions extends OptionsBase {
    private static CURRENT_VERSION;
    deltaFilePath: string;
    source: string;
    destination: string;
    deleteReportFile: string;
    forceFile: string;
    ignoreFile: string;
    isDryRun: boolean;
    fullCopyDirNames: string[];
    normalize(): void;
    loadDefaults(): Promise<void>;
    protected get currentVersion(): number;
}
