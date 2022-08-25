import path = require('path');
import { OutputFlags } from '@oclif/parser';
import { flags, UX } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
import { SfdxCore } from '../../../lib/sfdx-core';
import Utils, { IOItem } from '../../../lib/utils';
import { PackageOptions } from '../../../lib/package-options';
import { SfdxTasks } from '../../../lib/sfdx-tasks';
import { OptionsFactory } from '../../../lib/options-factory';
import Constants from '../../../lib/constants';
import { DeltaProvider } from '../../../lib/delta-provider';
import { DeltaCommandBase } from '../../../lib/delta-command';
import SchemaUtils from '../../../lib/schema-utils';

export default class Build extends CommandBase {
  public static description = CommandBase.messages.getMessage('package.build.commandDescription');

  public static examples = [
    `$ sfdx acu-pack:package:build -o options/package-options.json -x manifest/package-acu.xml -u myOrgAlias
    Builds a SFDX package file (./manifest/package.xml) which contains all the metadata from the myOrgAlias.
    The options defined (options/package-options.json) are honored when building the package.`,
    `$ sfdx acu-pack:package:build -f deploy
    Builds a SFDX package file (./manifest/package.xml) from the MDAPI formatted data in the deploy folder .`
  ];

  protected static flagsConfig = {
    package: flags.string({
      char: 'x',
      description: CommandBase.messages.getMessage('package.build.packageFlagDescription', [
        Constants.DEFAULT_PACKAGE_NAME,
      ]),
    }),
    metadata: flags.string({
      char: 'm',
      description: CommandBase.messages.getMessage('package.build.metadataFlagDescription'),
    }),
    options: flags.string({
      char: 'o',
      description: CommandBase.messages.getMessage('package.build.optionsFlagDescription'),
    }),
    namespaces: flags.string({
      char: 'n',
      description: CommandBase.messages.getMessage('namespacesFlagDescription'),
    }),
    source: flags.boolean({
      char: 't',
      description: CommandBase.messages.getMessage('package.build.sourceFlagDescription'),
    }),
    folder: flags.string({
      char: 'f',
      description: CommandBase.messages.getMessage('package.build.mdapiFolderFlagDescription'),
    }),
    append: flags.boolean({
      char: 'a',
      description: CommandBase.messages.getMessage('package.build.appendFlagDescription'),
    }),
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public static async getMetadataMapFromOrg(orgAlias: string, ux: UX, options: PackageOptions, cmdFlags: OutputFlags<any>): Promise<Map<string, string[]>> {
    const metadataMap = new Map<string, string[]>();
    const excluded = new Set<string>(options.excludeMetadataTypes);
    
    let filterMetadataTypes: Set<string> = null;
    if (cmdFlags.metadata) {
      filterMetadataTypes = new Set<string>();
      for (const metaName of cmdFlags.metadata.split(',')) {
        filterMetadataTypes.add(metaName.trim());
      }
    }

    if (cmdFlags.source) {
      const statuses = await SfdxTasks.getSourceTrackingStatus(orgAlias);
      if (!statuses || statuses.length === 0) {
        ux.log('No Source Tracking changes found.');
        return;
      }
      const results = SfdxTasks.getMapFromSourceTrackingStatus(statuses);
      if (results.conflicts.size > 0) {
        ux.log('WARNING: The following conflicts were found:');
        for (const [conflictType, members] of results.conflicts) {
          ux.log(`\t${conflictType as string}`);
          for (const member of members) {
            ux.log(`\t\t${member as string}`);
          }
        }
        throw new Error('All Conflicts must be resolved.');
      }
      if (results.deletes.size > 0) {
        ux.log('WARNING: The following deleted items need to be handled manually:');
        for (const [deleteType, members] of results.deletes) {
          ux.log(`\t${deleteType as string}`);
          for (const member of members) {
            ux.log(`\t\t${member as string}`);
          }
        }
      }
      if (!results.map?.size) {
        ux.log('No Deployable Source Tracking changes found.');
        return;
      }
      for (const [typeName, members] of results.map) {
        if ((filterMetadataTypes && !filterMetadataTypes.has(typeName)) || excluded.has(typeName)) {
          continue;
        }
        metadataMap.set(typeName, members);
      }
    } else {
      const describeMetadata = await SfdxTasks.describeMetadata(orgAlias);
      const describeMetadatas = new Set<any>();
      for (const metadata of describeMetadata) {
        if ((filterMetadataTypes && !filterMetadataTypes.has(metadata.xmlName)) || excluded.has(metadata.xmlName)) {
          continue;
        }
        describeMetadatas.add(metadata);
      }

      let counter = 0;
      
      // Are we including namespaces?
      const namespaces = cmdFlags.namespaces ? new Set<string>(cmdFlags.namespaces.split()) : new Set<string>();

      for await (const entry of SfdxTasks.getTypesForPackage(orgAlias, describeMetadatas, namespaces)) {
        // If specific members were defined previously - just use them
        metadataMap.set(entry.name, entry.members);
        ux.log(`Processed (${++counter}/${describeMetadatas.size}): ${entry.name as string}`);
      }
    }
    return metadataMap;
  }

  public static async getMetadataMapFromFolder(folder: string, ux: UX, options: PackageOptions): Promise<Map<string, string[]>> {
    const metadataMap = new Map<string, string[]>();
    
    const excluded = new Set<string>(options.excludeMetadataTypes);
    if(!excluded) {
      return;
    }
    if(!(await Utils.pathExists(folder))) {
      throw new Error(`The specified MDAPI folder does not exist: ${folder}`);
    }
    // Get all the folders from the root of the MDAPI folder
    for await (const folderPath of Utils.getFolders(folder, false)) {
      const packageType = options.mdapiMap.get(path.basename(folderPath));
      if(!packageType) {
        continue;
      }
      const members = [];
      for await (const memberFile of Build.getMDAPIFiles(packageType, folderPath, false)) {
        members.push(memberFile.replace(folderPath+path.sep,''));
      }
      metadataMap.set(packageType,members);
    }
    return metadataMap;
  }

  protected static async *getMDAPIFiles(xmlName: string, folder: string, isDocument = false): AsyncGenerator<string, void, void> {
    
    for await (const filePath of Utils.getItems(folder, IOItem.Both, false)) {
      if(filePath.endsWith(Constants.METADATA_FILE_SUFFIX)) {
        continue;
      }
      const itemName= path.basename(filePath);
      const isDir = await Utils.isDirectory(filePath);
      if(itemName !== 'unfiled$public') {
        if(isDocument) {
          yield itemName;
        } else if(!isDir) {
          yield SchemaUtils.getMetadataBaseName(itemName);
        }
      }
      // if not os.path.isdir(filePath) and xmlName in INST_PKG_REF_METADATA:
      // Common.removeInstPkgReference(filePath, Common.canRemoveAllPackageReferences(xmlName))
      if(isDir) {
        const fullCopyPath = DeltaProvider.getFullCopyPath(filePath, DeltaCommandBase.defaultCopyDirList);
        if(fullCopyPath) {
          yield itemName;
        } else {
          for await (const subFilePath of Build.getMDAPIFiles(xmlName, filePath, xmlName === 'Document')) {
            yield path.join(filePath, subFilePath);
          }
        }
      }
    }
  }
  
  protected async runInternal(): Promise<void> {
    // Validate the package path
    const packageFileName: string = this.flags.package || Constants.DEFAULT_PACKAGE_PATH;
    const packageDir = path.dirname(this.flags.folder ? this.flags.folder : packageFileName);

    if (packageDir && !(await Utils.pathExists(packageDir))) {
      this.raiseError(`The specified package folder does not exist: '${packageDir}'`);
    }

    let options: PackageOptions;
    // Read/Write the options file if it does not exist already
    if (this.flags.options) {
      options = await OptionsFactory.get(PackageOptions, this.flags.options);
      if (!options) {
        this.raiseError(`Unable to read options file: ${this.flags.options as string}.`);
      }
    } else {
      options = new PackageOptions();
      await options.loadDefaults();
    }

    let metadataMap = null;
    try {
      if(this.flags.folder) {
        metadataMap = await Build.getMetadataMapFromFolder(this.flags.folder, this.ux, options);
      } else {
        this.ux.log(`Gathering metadata from Org: ${this.orgAlias}(${this.orgId})`);
        metadataMap = await Build.getMetadataMapFromOrg(this.orgAlias, this.ux, options, this.flags);
      }
    } catch (err) {
      this.raiseError(err.message);
    }
    
    const packageMap = new Map<string, string[]>();
    const excluded = new Set<string>(options.excludeMetadataTypes);

    // Filter excluded types
    for (const [typeName, members] of metadataMap) {
      if (!excluded.has(typeName)) {
        Utils.sortArray(members);
        packageMap.set(typeName, members);
      }
    }

    this.ux.log(`Generating: ${packageFileName}`);
    // Write the final package
    await SfdxCore.writePackageFile(packageMap, packageFileName, this.flags.append);
    return;
  }
}
