import { OptionsBase } from './options';
export declare class PackageOptions extends OptionsBase {
    private static CURRENT_VERSION;
    excludeMetadataTypes: string[];
    mdapiMap: Map<string, string>;
    mdapiNotStar: string[];
    mdapiIgnore: string[];
    deserialize(serializedOptions: string): Promise<void>;
    serialize(): Promise<string>;
    loadDefaults(): Promise<void>;
    protected get currentVersion(): number;
}
