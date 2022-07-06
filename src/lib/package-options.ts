import { OptionsBase } from './options';
import { SfdxTasks } from '../lib/sfdx-tasks';

export class PackageOptions extends OptionsBase {
    private static CURRENT_VERSION: number = 1.0;

    public excludeMetadataTypes: string[] = [];

    public async loadDefaults(): Promise<void> {
        // When the defaults are loaded - we will pull from the Metadata Coverage Report
        // If we are not allowing external connections at runtime (FedRAMP) - just set to empty array
        this.excludeMetadataTypes = this.settings.blockExternalConnections
            ? []
            : await SfdxTasks.getUnsupportedMetadataTypes();
        return;
    }

    protected get currentVersion(): number {
        return PackageOptions.CURRENT_VERSION;
    }

}
