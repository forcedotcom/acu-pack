import { flags } from '@salesforce/command';
import Utils from './utils';
import { promises as fs } from 'fs';
import path = require('path');

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

  public logFile = 'delta.log';
  public deltaOptions = new DeltaOptions();

  public abstract name: string;
  public abstract deltaLineToken: string;
  public abstract deltas: Map<string, any>;

  public abstract processDeltaLine(deltaLine: string): void;
  public abstract getMessage(name: string): string;
  public abstract diffAsync(source: string): AsyncGenerator<Delta, any, any>;

  public getFlagsConfig(flagsConfig: any): any {
    if (!flagsConfig) {
      flagsConfig = {};
    }
    if (!flagsConfig.source) {
      flagsConfig.source = flags.filepath({
        char: 's',
        required: true,
        description: this.getMessage('source.delta.sourceFlagDescription')
      });
    }
    if (!flagsConfig.destination) {
      flagsConfig.destination = flags.filepath({
        char: 'd',
        description: this.getMessage('source.delta.destinationFlagDescription')
      });
    }
    if (!flagsConfig.force) {
      flagsConfig.force = flags.filepath({
        char: 'f',
        description: this.getMessage('source.delta.forceFlagDescription')
      });
    }
    if (!flagsConfig.ignore) {
      flagsConfig.ignore = flags.filepath({
        char: 'i',
        description: this.getMessage('source.delta.ignoreFlagDescription')
      });
    }
    if (!flagsConfig.deletereport) {
      flagsConfig.deletereport = flags.filepath({
        char: 'r',
        description: this.getMessage('source.delta.deleteReportFlagDescription')
      });
    }
    if (!flagsConfig.check) {
      flagsConfig.check = flags.boolean({
        char: 'c',
        description: this.getMessage('source.delta.checkFlagDescription')
      });
    }
    return flagsConfig;

  }

  public async run(deltaOptions: DeltaOptions): Promise<void> {
    if (!deltaOptions) {
      throw new Error('No DeltaOptions specified.');
    } else {
      this.deltaOptions = deltaOptions;
      this.deltaOptions.normalize();
    }
    // Reset log file
    if (await Utils.pathExistsAsync(this.logFile)) {
      await fs.unlink(this.logFile);
    }

    try {
      // Validate flags/options
      const result = await this.validateDeltaOptionsAsync(deltaOptions);
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

      // Create Deleted Report File
      if (deleteReportFile && destination) {
        try {
          // write the deleted-files.txt report into the parent folder of the destination
          await fs.unlink(deleteReportFile);
        } catch (err) {
          if (!Utils.isENOENT(err)) {
            await this.logMessage(`Unable to delete old report: ${err.message}.`);
          }
        }
      }

      if (ignoreFile) {
        await this.logMessage('Ignore Set:');
        for await (const line of Utils.readFileAsync(ignoreFile)) {
          for await (const filePath of Utils.getFilesAsync(line)) {
            ignoreSet.add(path.normalize(filePath));
            await this.logMessage(`\t${filePath}`);
          }
        }
      }

      if (!this.diffAsync) {
        await this.logMessage('Unable to find a diff method.', true);
        return;
      }

      const metrics = {
        Copy: 0,
        Del: 0,
        None: 0,
        Ign: 0
      };

      if (isDryRun) {
        await this.logMessage(`Begin DRY-RUN Diff (${this.name})`);
      } else {
        await this.logMessage(`Begin Diff (${this.name})`);
      }

      // try and load the delta file
      await this.loadDeltaFileAsync();

      if (forceFile) {
        if (this.deltas.size > 0) {
          // Remove the force entries from the hash so they
          // 'act' like new files and are copiied to the destination.
          await this.logMessage('Puring force file entries from deltas.', true);
          for await (const line of Utils.readFileAsync(forceFile)) {
            for await (const filePath of Utils.getFilesAsync(line)) {
              if (this.deltas.delete(filePath)) {
                await this.logMessage(`Purged: ${filePath}`, true);
              }
            }
          }
        }
      }

      await this.logMessage(`Scanning folder: ${source}.`, true);
      for await (const delta of this.diffAsync(source)) {
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
            for await (const filePath of Utils.getFilesAsync(path.dirname(deltaFile), false)) {
              if (path.basename(filePath).startsWith(`${path.basename(deltaFile).split('.')[0]}.`)) {
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
  }

  public async loadDeltaFileAsync(deltaFilePath?: string): Promise<void> {
    // only load the hash once
    deltaFilePath = deltaFilePath ? path.normalize(deltaFilePath) : this.deltaOptions.deltaFilePath;
    if (deltaFilePath && this.deltas.size === 0) {
      await this.logMessage(`Loading delta file: ${deltaFilePath}`);
      for await (const line of Utils.readFileAsync(deltaFilePath)) {
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

  public async validateDeltaOptionsAsync(deltaOptions: DeltaOptions): Promise<string> {
    if (!deltaOptions.source) {
      return 'No delta -s(ource) specified.';
    }
    return null;
  }

}
