import { OptionsBase } from './options';
export declare class PackageOptions extends OptionsBase {
    excludeMetadataTypes: string[];
    skipFileNamePattern: string;
    packageApiVersionOverride: string;
    customObjectNamePattern: string;
    sfdxLogLevel: string;
    loadDefaults(): Promise<void>;
}
