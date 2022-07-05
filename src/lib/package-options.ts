import { OptionsBase } from './options';

export class PackageOptions extends OptionsBase {
    private static CURRENT_VERSION: number = 1.0;

    public excludeMetadataTypes: string[] = [];

    public loadDefaults(): Promise<void> {
        this.excludeMetadataTypes = [];
        return Promise.resolve();
    }

    protected get currentVersion(): number {
        return PackageOptions.CURRENT_VERSION;
    }

}
