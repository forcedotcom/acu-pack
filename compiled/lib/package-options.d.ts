import { OptionsBase } from './options';
export declare class PackageOptions extends OptionsBase {
    private static CURRENT_VERSION;
    excludeMetadataTypes: string[];
    skipFileNamePattern: string;
    packageApiVersionOverride: string;
    customObjectNamePattern: string;
    sfdxLogLevel: string;
    loadDefaults(): Promise<void>;
    protected get currentVersion(): number;
}
