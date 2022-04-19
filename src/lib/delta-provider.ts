import Utils from './utils';
import { promises as fs } from 'fs';
import path = require('path');
import { DeltaCommandBase } from './delta-command';

export class Delta {
    public deltaKind: string;
    public deltaFile: string;

    constructor(deltaKind: string, deltaFile: string) {
        this.deltaKind = deltaKind;
        this.deltaFile = deltaFile;
    }
}

export class DeltaOptions {
    public deltaFilePath: string;
    public source: string;
    public destination: string;
    public deleteReportFile: string;
    public forceFile: string;
    public ignoreFile: string;
    public isDryRun: boolean;
    public fullCopyDirNames: string[] = DeltaCommandBase.defaultCopyDirList;

    public normalize() {
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
}

export abstract class DeltaProvider {
    public static deltaTypeKind = {
        NONE: 'NONE',
        A: 'A',
        M: 'M',
        D: 'D'
    };

    public static isFullCopyPath(filePath: string, deltaOptions: DeltaOptions): boolean {
        if (filePath && deltaOptions) {
            for (const dirName of deltaOptions.fullCopyDirNames) {
                if (filePath.includes(`${path.sep}${dirName}${path.sep}`)) {
                    return true;
                }
            }
        }
        return false;
    }

    public logFile = 'delta.log';
    public deltaOptions = new DeltaOptions();

    public abstract name: string;
    public abstract deltaLineToken: string;
    public abstract deltas: Map<string, any>;

    public abstract processDeltaLine(deltaLine: string): void;
    public abstract getMessage(name: string): string;
    public abstract diff(source: string): AsyncGenerator<Delta, any, any>;

    public async run(deltaOptions: DeltaOptions): Promise<any> {
        if (!deltaOptions) {
            throw new Error('No DeltaOptions specified.');
        } else {
            this.deltaOptions = deltaOptions;
            this.deltaOptions.normalize();
        }
        // Reset log file
        await Utils.deleteFile(this.logFile);

        const metrics = {
            Copy: 0,
            Del: 0,
            None: 0,
            Ign: 0
        };

        try {
            // Validate flags/options
            const result = await this.validateDeltaOptions(deltaOptions);
            if (result) {
                throw new Error(result);
            }

            // Make sure all the paths are normalized (windows vs linux)
            const source = deltaOptions.source;
            const destination = deltaOptions.destination;
            const deleteReportFile = deltaOptions.deleteReportFile;
            const forceFile = deltaOptions.forceFile;
            const ignoreFile = deltaOptions.ignoreFile;
            const isDryRun = deltaOptions.isDryRun;
            const ignoreSet = new Set();
            const copiedSet = new Set();
            const metaFileEndsWith = '-meta.xml';

            // Create Deleted Report File
            if (deleteReportFile && destination) {
                try {
                    // write the deleted-files.txt report into the parent folder of the destination
                    // Reset log file
                    await Utils.deleteFile(deleteReportFile);
                } catch (err) {
                    if (!Utils.isENOENT(err)) {
                        await this.logMessage(`Unable to delete old report: ${err.message}.`);
                    }
                }
            }

            if (ignoreFile) {
                await this.logMessage('Ignore Set:');
                for await (const line of Utils.readFileLines(ignoreFile)) {
                    for await (const filePath of Utils.getFiles(line)) {
                        ignoreSet.add(path.normalize(filePath));
                        await this.logMessage(`\t${filePath}`);
                    }
                }
            }

            if (!this.diff) {
                await this.logMessage('Unable to find a diff method.', true);
                return;
            }

            if (isDryRun) {
                await this.logMessage(`Begin DRY-RUN Diff (${this.name})`);
            } else {
                await this.logMessage(`Begin Diff (${this.name})`);
            }

            // try and load the delta file
            await this.loadDeltaFile();

            if (forceFile) {
                if (this.deltas.size > 0) {
                    // Remove the force entries from the hash so they
                    // 'act' like new files and are copiied to the destination.
                    await this.logMessage('Puring force file entries from deltas.', true);
                    for await (const line of Utils.readFileLines(forceFile)) {
                        for await (const filePath of Utils.getFiles(line)) {
                            if (this.deltas.delete(filePath)) {
                                await this.logMessage(`Purged: ${filePath}`, true);
                            }
                        }
                    }
                }
            }

            await this.logMessage(`Scanning folder: ${source}.`, true);
            for await (const delta of this.diff(source)) {
                const deltaKind = delta.deltaKind;
                const deltaFile = delta.deltaFile;

                // No destination? no need to continue
                if (!destination) {
                    continue;
                }
                if (ignoreSet.has(deltaFile)) {
                    await this.logMessage(`Delta (${deltaKind}) ignored: ${deltaFile}`, true);
                    metrics.Ign++;
                    continue;
                }
                // Determine the action
                switch (deltaKind) {
                    // [D]eleted files
                    case DeltaProvider.deltaTypeKind.D:
                        await this.logMessage(`DELETED File: ${deltaFile}`);
                        if (deleteReportFile) {
                            await fs.appendFile(deleteReportFile, deltaFile + '\r\n');
                        }
                        metrics.Del++;
                        break;
                    // [A]dded & [M]odified files
                    case DeltaProvider.deltaTypeKind.A:
                    case DeltaProvider.deltaTypeKind.M:
                        // check the source folder for associated files.
                        const dirName = path.dirname(deltaFile);
                        const deltaFileBaseName = `${path.basename(deltaFile).split('.')[0]}.`;
                        let foundMetadataFile = false;
                        for await (const filePath of Utils.getFiles(dirName, false)) {
                            // have we already processed this file?
                            if (copiedSet.has(filePath)) {
                                continue;
                            }
                            if (DeltaProvider.isFullCopyPath(dirName, deltaOptions) || path.basename(filePath).startsWith(deltaFileBaseName)) {
                                // are we ignoring this file?
                                if (ignoreSet.has(filePath)) {
                                    await this.logMessage(`Delta (${deltaKind}) ignored: ${filePath}`, true);
                                    metrics.Ign++;
                                } else {
                                    const destinationPath = filePath.replace(source, destination);
                                    if (!isDryRun) {
                                        await Utils.copyFile(filePath, destinationPath);
                                    }
                                    await this.logMessage(`Delta (${deltaKind}) found: ${destinationPath}`);
                                    metrics.Copy++;
                                    copiedSet.add(filePath);
                                }
                                if (filePath.endsWith(metaFileEndsWith)) {
                                    foundMetadataFile = true;
                                }
                            }
                        }
                        if (!foundMetadataFile) {
                            // Sometimes the meta-data files can be located in the parent dir (staticresources & documents)
                            // so let's check there
                            const parentDirName = path.dirname(dirName);
                            const deltaParentBaseName = `${path.basename(dirName)}.`;
                            for await (const parentFilePath of Utils.getFiles(parentDirName, false)) {
                                // have we already processed this file?
                                if (copiedSet.has(parentFilePath)) {
                                    continue;
                                }
                                // are we ignoring this file?
                                if (ignoreSet.has(parentFilePath)) {
                                    await this.logMessage(`Delta (${deltaKind}) ignored: ${parentFilePath}`, true);
                                    metrics.Ign++;
                                    continue;
                                }
                                if (path.basename(parentFilePath).startsWith(deltaParentBaseName)) {
                                    const destinationPath = parentFilePath.replace(source, destination);
                                    if (!isDryRun) {
                                        await Utils.copyFile(parentFilePath, destinationPath);
                                    }
                                    await this.logMessage(`Delta (${deltaKind}) found: ${destinationPath}`);
                                    metrics.Copy++;
                                    copiedSet.add(parentFilePath);
                                    foundMetadataFile = true;
                                }
                            }
                        }
                        break;
                    case DeltaProvider.deltaTypeKind.NONE:
                        await this.logMessage(`Delta (${deltaKind}): ${deltaFile}`);
                        metrics.None++;
                        break;
                }
            }
            await this.logMessage(`Metrics: ${JSON.stringify(metrics)}`, true);
        } catch (err) {
            await this.logMessage(err, true);
        } finally {
            await this.logMessage('Done', true);
        }
        return metrics;
    }

    public async loadDeltaFile(deltaFilePath?: string): Promise<void> {
        // only load the hash once
        deltaFilePath = deltaFilePath ? path.normalize(deltaFilePath) : this.deltaOptions.deltaFilePath;
        if (deltaFilePath && this.deltas.size === 0) {
            await this.logMessage(`Loading delta file: ${deltaFilePath}`);
            for await (const line of Utils.readFileLines(deltaFilePath)) {
                if (!line || !line.trim()) {
                    continue;
                }
                if (line.indexOf(this.deltaLineToken) === -1) {
                    await this.logMessage(`Skipping invalid line: ${line}`, true);
                    continue;
                }
                this.processDeltaLine(line);
            }
            await this.logMessage(`Loaded delta file: ${deltaFilePath} with ${this.deltas.size} entries.`);
        }
    }

    public async logMessage(message: string, includeConsole = false): Promise<void> {
        if (typeof message === 'string') {
            await fs.appendFile(this.logFile, `${message}\r\n`);
        } else {
            await fs.appendFile(this.logFile, `${JSON.stringify(message)}\r\n`);
        }
        if (includeConsole) {
            console.log(message);
        }
    }

    public async validateDeltaOptions(deltaOptions: DeltaOptions): Promise<string> {
        if (!deltaOptions.source) {
            return 'No delta -s(ource) specified.';
        }
        return null;
    }
}
