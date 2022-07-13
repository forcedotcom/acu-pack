import path = require('path');
import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
import { SfdxTasks } from '../../../lib/sfdx-tasks';
import { SfdxPermission } from '../../../lib/sfdx-permission';
import { SfdxCore } from '../../../lib/sfdx-core';
import Utils from '../../../lib/utils';

export default class Permissions extends CommandBase {
  public static packageFileName = 'package-permissions.xml';
  public static description = CommandBase.messages.getMessage('package.permissions.commandDescription');

  public static examples = [`$ sfdx acumen:package:permissions -u myOrgAlias
    Creates a package file (${Permissions.packageFileName}) which contains
    Profile & PermissionSet metadata related to ${SfdxPermission.defaultPermissionMetaTypes.join(', ')} permissions.`,
  `$ sfdx acumen:package:permissions -u myOrgAlias -m CustomObject,CustomApplication
    Creates a package file (${Permissions.packageFileName}) which contains
    Profile & PermissionSet metadata related to CustomObject & CustomApplication permissions.`];

  protected static flagsConfig = {
    package: flags.string({
      char: 'x',
      description: CommandBase.messages.getMessage('package.permissions.packageFlagDescription', [Permissions.packageFileName])
    }),
    metadata: flags.string({
      char: 'm',
      description: CommandBase.messages.getMessage('package.permissions.metadataFlagDescription', [SfdxPermission.defaultPermissionMetaTypes.join(', ')])
    }),
    namespaces: flags.string({
      char: 'n',
      description: CommandBase.messages.getMessage('namespacesFlagDescription')
    })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  protected metaNames: Set<string>;
  protected namespaces: Set<string>;
  protected packageFileName: string;

  protected async runInternal(): Promise<void> {
    // Gather metadata names to include
    const metaNames = Utils.sortArray(this.flags.metadata
      ? this.flags.metadata.split()
      : SfdxPermission.defaultPermissionMetaTypes);
    this.metaNames = new Set(metaNames);

    // Are we including namespaces?
    this.namespaces = this.flags.namespaces
      ? new Set<string>(this.flags.namespaces.split())
      : new Set<string>();

    this.packageFileName = this.flags.package || Permissions.packageFileName;

    const packageDir = path.dirname(this.packageFileName);
    if (packageDir && !await Utils.pathExists(packageDir)) {
      this.raiseError(`The specified package folder does not exist: '${packageDir}'`);
    }

    this.ux.log(`Gathering metadata from Org: ${this.orgAlias}(${this.orgId})`);
    const describeMetadata = await SfdxTasks.describeMetadata(this.orgAlias);

    const describeMetadatas = new Set<string>();
    for (const metadata of describeMetadata) {
      if (this.metaNames.has(metadata.xmlName)) {
        describeMetadatas.add(metadata);
        continue;
      }

      if (metadata.childXmlNames) {
        for (const childName of metadata.childXmlNames) {
          if (this.metaNames.has(childName)) {
            // 'adopt' the childName as the xmlName to pull the child metadata
            metadata.xmlName = childName;
            describeMetadatas.add(metadata);
          }
        }
      }
    }

    this.ux.log(`Generating: ${this.packageFileName}`);

    const metadataMap = new Map<string, string[]>();
    let counter = 0;
    for await (const entry of SfdxTasks.getTypesForPackage(this.orgAlias, describeMetadatas, this.namespaces)) {
      metadataMap.set(entry.name, entry.members);
      this.ux.log(`Processed (${++counter}/${this.metaNames.size}): ${entry.name as string}`);
    }
    // Write the final package
    await SfdxCore.writePackageFile(metadataMap, this.packageFileName);
    return;
  }
}
