import { promises as fs } from 'fs';
import path = require('path');
import { flags } from '@salesforce/command';
import md5File = require('md5-file');
import { CommandBase } from '../../../../lib/command-base';
import { DeltaCommandBase } from '../../../../lib/delta-command';
import Utils from '../../../../lib/utils';
import { DeltaProvider, Delta } from '../../../../lib/delta-provider';

export default class Md5 extends CommandBase {
  public static description = CommandBase.messages.getMessage('source.delta.md5.commandDescription');

  public static examples = [
    `$ sfdx acu-pack:source:delta:md5 -m md5.txt -s force-app -d deploy
    Reads the specified -(m)d5 file 'md5.txt' and uses it to identify the deltas in
    -(s)ource 'force-app' and copies them to -(d)estination 'deploy'`,
  ];

  public static md5DeltaProvider = class extends DeltaProvider {
    public deltaLineToken = '=';
    public name = 'md5';
    public deltas = new Map<string, any>();

    public processDeltaLine(deltaLine: string): void {
      const parts = deltaLine.split(this.deltaLineToken);
      this.deltas.set(parts[0], { hash: parts[1], isFound: false });
    }

    public getMessage(name: string): string {
      return CommandBase.messages.getMessage(name);
    }

    public async *diff(source: string): AsyncGenerator<Delta, any, any> {
      let hasUpdates = false;
      source = source ? Utils.normalizePath(source) : this.deltaOptions.source;

      for await (const deltaFile of Utils.getFiles(source)) {
        if (source && !deltaFile.startsWith(source)) {
          await this.logMessage(`Skipping delta file line: '${deltaFile}' not in source path: '${source}'.`, true);
          continue;
        }

        const hash = md5File.sync(deltaFile);
        const entry = this.deltas.get(deltaFile);
        let deltaKind: string;
        // Is this the same?
        if (!entry) {
          deltaKind = DeltaProvider.deltaTypeKind.A;
          this.deltas.set(deltaFile, { hash, isFound: true });
          hasUpdates = true;
        } else if (hash !== entry.hash) {
          deltaKind = DeltaProvider.deltaTypeKind.M;
          this.deltas.set(deltaFile, { hash, isFound: true });
          hasUpdates = true;
        } else {
          deltaKind = DeltaProvider.deltaTypeKind.NONE;
          this.deltas.set(deltaFile, { hash, isFound: true });
        }
        // return the delta
        yield new Delta(deltaKind, deltaFile);
      }

      // Check for deletes
      const deleted = [];
      for (const [fp, data] of this.deltas) {
        if (!data.isFound) {
          // note deleted files
          deleted.push({ deltaKind: DeltaProvider.deltaTypeKind.D, deltaFile: fp });
          hasUpdates = true;
        }
      }

      // Return deleted entries
      for (const del of deleted) {
        yield del;
        // Remove the delete entry from the deltas
        this.deltas.delete(del.deltaFile);
      }

      // Update hash file?
      if (hasUpdates) {
        const md5FilePath = this.deltaOptions.deltaFilePath;
        await this.logMessage('Updating hash file...', true);
        if (!(await Utils.pathExists(md5FilePath))) {
          const folder = path.dirname(md5FilePath);
          if (folder && !(await Utils.pathExists(folder))) {
            await Utils.mkDirPath(folder);
          }
        } else {
          await fs.unlink(md5FilePath);
        }
        for (const [fp, data] of this.deltas) {
          await fs.appendFile(md5FilePath, `${fp}${this.deltaLineToken}${data.hash as string}\r\n`);
        }
        await this.logMessage(`Updated hash file: ${md5FilePath} with ${this.deltas.size} entries.`, true);
      }
    }
  };

  protected static flagsConfig = DeltaCommandBase.getFlagsConfig({
    md5: flags.filepath({
      char: 'm',
      description: CommandBase.messages.getMessage('source.delta.md5.md5FlagDescription'),
    }),
  });

  protected name = 'md5';
  protected deltas = new Map<string, any>();

  protected async runInternal(): Promise<void> {
    const deltaOptions = await DeltaCommandBase.getDeltaOptions(this.flags);
    if(!deltaOptions.deltaFilePath) {
      deltaOptions.deltaFilePath = this.flags.md5;
    }

    const gitProvider = new Md5.md5DeltaProvider();
    await gitProvider.run(deltaOptions);
  }
}
