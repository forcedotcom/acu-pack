import { flags } from '@salesforce/command';
import { SfdxError } from '@salesforce/core';
import { CommandBase } from '../../../lib/command-base';
import { SfdxCore } from '../../../lib/sfdx-core';
import Utils from '../../../lib/utils';
import { PackageOptions } from '../../../lib/package-options';
import path = require('path');
import { SfdxTasks } from '../../../lib/sfdx-tasks';
import { OptionsFactory } from '../../../lib/options-factory';

export default class Build extends CommandBase {
  public static description = CommandBase.messages.getMessage('package.build.commandDescription');
  public static defaultPackageFileName = 'package.xml';

  public static examples = [
    `$ sfdx acumen:package:build -o options/package-options.json -x manifest/package-acu.xml -u myOrgAlias
    Builds a SFDX package file (./manifest/package.xml) which contains all the metadata from the myOrgAlias.
    The options defined (options/package-options.json) are honored when building the package.`];

  protected static flagsConfig = {
    package: flags.string({
      char: 'x',
      description: CommandBase.messages.getMessage('package.build.packageFlagDescription', [Build.defaultPackageFileName])
    }),
    metadata: flags.string({
      char: 'm',
      description: CommandBase.messages.getMessage('package.build.metadataFlagDescription')
    }),
    options: flags.string({
      char: 'o',
      description: CommandBase.messages.getMessage('package.build.optionsFlagDescription')
    }),
    namespaces: flags.string({
      char: 'n',
      description: CommandBase.messages.getMessage('namespacesFlagDescription')
    }),
    source: flags.boolean({
      char: 's',
      description: CommandBase.messages.getMessage('package.build.sourceFlagDescription')
    })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<void> {
    // Validate the package path
    const packageFileName = this.flags.package || Build.defaultPackageFileName;
    const packageDir = path.dirname(packageFileName);

    if (packageDir && !await Utils.pathExists(packageDir)) {
      throw new SfdxError(`The specified package folder does not exist: '${packageDir}'`);
    }

    let options: PackageOptions;
    // Read/Write the options file if it does not exist already
    if (this.flags.options) {
      options = await OptionsFactory.get(PackageOptions, this.flags.options);
      if (!options) {
        this.ux.log(`Unable to read options file: ${this.flags.options}.`);
        // Set the proper exit code to indicate violation/failure
        process.exitCode = 1;
        return;
      }
    } else {
      options = new PackageOptions();
      await options.loadDefaults();
    }

    if (this.flags.source && this.flags.metadata) {
      this.ux.log('Both source (-s) and metadata (-m) flags cannot be specified, please use one or the other.');
      return;
    }

    const excluded = new Set<string>(options.excludeMetadataTypes);

    // Are we including namespaces?
    const namespaces = this.flags.namespaces
      ? new Set<string>(this.flags.namespaces.split())
      : new Set<string>();

    const orgAlias = this.flags.targetusername;
    const orgId = this.org.getOrgId();
    try {

      const describeMetadatas = new Set<object>();

      this.ux.log(`Gathering metadata from Org: ${orgAlias}(${orgId})`);

      let metadataMap = new Map<string, string[]>();
      if (this.flags.source) {
        const statuses = await SfdxTasks.getSourceTrackingStatus(orgAlias);
        if (!statuses || statuses.length === 0) {
          this.ux.log('No Source Tracking changes found.');
          return;
        }
        const results = await SfdxTasks.getMapFromSourceTrackingStatus(statuses);
        if (results.conflicts.length > 0) {
          throw new Error(`WARNING: Conflicts detected for the following metadata types: ${results.conflicts.join(', ')}`);
        }
        if (results.deletes.length > 0) {
          this.ux.log('WARNING: The following deleted items need to be handled manually:');
          for (const deleteType of results.deletes) {
            this.ux.log(`\t${deleteType}`);
          }
        }
        if (!results.map?.size) {
          this.ux.log('No Deployable Source Tracking changes found.');
          return;
        }
        metadataMap = results.map;
      } else {
        const describeMetadata = await SfdxTasks.describeMetadata(orgAlias);
        let forceMetadataTypes: Set<string> = null;
        if (this.flags.metadata) {
          forceMetadataTypes = new Set<string>();
          for (const metaName of this.flags.metadata.split(',')) {
            forceMetadataTypes.add(metaName.trim());
          }
        }

        for (const metadata of describeMetadata) {
          if ((forceMetadataTypes && !forceMetadataTypes.has(metadata.xmlName)) || excluded.has(metadata.xmlName)) {
            continue;
          }
          describeMetadatas.add(metadata);
        }

        let counter = 0;
        for await (const entry of SfdxTasks.getTypesForPackage(orgAlias, describeMetadatas, namespaces)) {
          // If specific members were defined previously - just use them
          metadataMap.set(entry.name, entry.members);
          this.ux.log(`Processed (${++counter}/${describeMetadatas.size}): ${entry.name}`);
        }

      }
      const packageMap = new Map<string, string[]>();

      // Filter excluded types
      for (const [typeName, members] of metadataMap) {
        if (!excluded.has(typeName)) {
          packageMap.set(typeName, members);
        }
      }

      this.ux.log(`Generating: ${packageFileName}`);
      // Write the final package
      await SfdxCore.writePackageFile(packageMap, packageFileName);

      this.ux.log('Done.');
    } catch (err) {
      throw err;
    }
    return;
  }
}
