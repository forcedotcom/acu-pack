import path = require('path');
import { DeltaCommandBase } from './delta-command';
import { OptionsBase } from './options';

export class DeltaOptions extends OptionsBase {
    private static CURRENT_VERSION = 1.0;

    public deltaFilePath: string = null;
    public source: string = null;
    public destination: string = null;
    public deleteReportFile: string = null;
    public forceFile: string = null;
    public ignoreFile: string = null;
    public isDryRun = false;
    public fullCopyDirNames: string[] = DeltaCommandBase.defaultCopyDirList;

    public normalize(): void {
        if (this.deltaFilePath) {
            this.deltaFilePath = path.normalize(this.deltaFilePath);
        }
        if (this.source) {
            this.source = path.normalize(this.source);
        }
        if (this.destination) {
            this.destination = path.normalize(this.destination);
        }
        if (this.deleteReportFile) {
            this.deleteReportFile = path.normalize(this.deleteReportFile);
        }
        if (this.forceFile) {
            this.forceFile = path.normalize(this.forceFile);
        }
        if (this.ignoreFile) {
            this.ignoreFile = path.normalize(this.ignoreFile);
        }
    }

    public loadDefaults(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.deltaFilePath = '';
                this.source = '';
                this.destination = '';
                this.deleteReportFile = '';
                this.forceFile = '';
                this.ignoreFile = '';
                this.isDryRun = false;
                this.fullCopyDirNames = DeltaCommandBase.defaultCopyDirList;
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    protected get currentVersion(): number {
        return DeltaOptions.CURRENT_VERSION;
    }
}
