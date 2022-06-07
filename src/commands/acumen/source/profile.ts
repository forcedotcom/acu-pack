import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
/*
import Utils from '../../../lib/utils';
import path = require('path');
import { SfdxPermission, PermissionSet } from '../../../lib/sfdx-permission';
import { SfdxTasks } from '../../../lib/sfdx-tasks';
*/

export default class Profile extends CommandBase {
  public static defaultSourceFolder: string = null;
  public static defaultPermissionsGlobs = [
    '**/profiles/*.profile-meta.xml',
    '**/permissionsets/*.permissionset-meta.xml'
  ];

  public static description = CommandBase.messages.getMessage('source.profile.commandDescription');
  public static examples = [
    `$ sfdx acumen:source:profile -u myOrgAlias
    Compares the profile metadata files in ${Profile.defaultPermissionsGlobs.join(',')} to the specified Org to detemrine deployment compatibility.`,
    `$ sfdx acumen:source:profile -m true -u myOrgAlias
    Compares the profile metadata files in ${Profile.defaultPermissionsGlobs.join(',')} to the specified Org to and updates the metadat files to ensuredeployment compatibility.`];

  protected static flagsConfig = {
    source: flags.string({
      char: 'p',
      description: CommandBase.messages.getMessage('source.profile.profilePathFlagDescription', [Profile.defaultPermissionsGlobs.join(',')]),
      required: false
    }),
    modify: flags.boolean({
      char: 'm',
      description: CommandBase.messages.getMessage('source.profile.modifyFlagDescription'),
      required: false
    }),
    output: flags.string({
      char: 'o',
      description: CommandBase.messages.getMessage('source.profile.outputFoldersFlagDescription'),
      required: false
    })
  };

  //protected static requiresProject = false;
  //protected static requiresUsername = true;

  //protected permissions: Map<string, PermissionSet>;

  public async run(): Promise<void> {
    this.ux.log(`\tThis command has been depricated.`);
    // const sourceFolders = !this.flags.source
    //   ? Profile.defaultPermissionsGlobs
    //   : this.flags.source.split(',');

    // this.ux.log('Gathering securable metadata information from Org:');
    // this.ux.log(`${SfdxPermission.defaultPermissionMetaTypes}`);
    // const metaDataMap = await SfdxTasks.listMetadatas(this.orgAlias, SfdxPermission.defaultPermissionMetaTypes);

    // this.permissions = new Map<string, PermissionSet>();

    // let gotStandardTabs = false;

    // for (const sourceFolder of sourceFolders) {
    //   if (!sourceFolder) {
    //     continue;
    //   }
    //   this.ux.log(`Reading metadata in: ${sourceFolder}`);
    //   for await (const filePath of Utils.getFiles(sourceFolder.trim())) {
    //     this.ux.log(`\tProcessing: ${filePath}`);
    //     const json = await Utils.readObjectFromXmlFile(filePath);

    //     if (!json.PermissionSet && !json.Profile) {
    //       this.ux.log(`\tUnable to process file: ${filePath}`);
    //       continue;
    //     }

    //     const permSet = PermissionSet.fromXml(filePath, json);
    //     const newPermSet = new PermissionSet();
    //     for (const [metadataName, members] of metaDataMap) {
    //       const permSetErrors = [];
    //       const existingNames = [];
    //       const standardTabs = [];

    //       const permCollection = permSet.getPermissionCollection(metadataName);
    //       const newPermCollection = newPermSet.getPermissionCollection(metadataName);

    //       switch (metadataName) {
    //         case SfdxPermission.customTab:
    //           if (permSet.tabVisibilities) {
    //             for (const [tabName, tabPerm] of permCollection) {
    //               if (tabPerm['isStandard']) {
    //                 // Standard Tabs are not exposed via the Metadata API
    //                 standardTabs.push(tabName);
    //                 gotStandardTabs = true;
    //                 continue;
    //               }
    //               existingNames.push(tabName);
    //             }
    //           }
    //           break;
    //         default:
    //           if (permCollection) {
    //             existingNames.push(...permCollection.keys());
    //           }
    //       }
    //       const typeNames = new Set(members);
    //       for (const existingName of existingNames) {
    //         if (!typeNames.has(existingName)) {
    //           permSetErrors.push(`${existingName} NOT found.`);
    //         } else {
    //           newPermCollection.set(existingName, permCollection.get(existingName));
    //         }
    //       }

    //       if (standardTabs.length > 0) {
    //         for (const standardTab of standardTabs) {
    //           permSetErrors.push(`\t${standardTab} (*)`);
    //         }
    //       }
    //       if (permSetErrors.length > 0) {
    //         this.ux.log(`\t\t${metadataName}:`);
    //         for (const error of permSetErrors) {
    //           this.ux.log(`\t\t\t${error}`);
    //         }
    //       }

    //     }
    //     if (this.flags.modify) {
    //       const outFilePath = this.flags.output
    //         ? path.join(this.flags.output, filePath)
    //         : filePath;

    //       this.ux.log(`\tUpdating: ${outFilePath}`);
    //       await Utils.writeObjectToXmlFile(outFilePath, newPermSet.toXmlObj());
    //     }
    //   }
    // }
    // if (gotStandardTabs) {
    //   this.ux.log('(*) WARNING: Standard Tab permissions detected.');
    //   this.ux.log('Salesforce does not expose Standard Tabs via the Metadata API.');
    //   this.ux.log(`Compatibility with '${this.orgAlias}' can only be ensured if these permissions are removed.`);
    // }

    // this.ux.log('Done.');

    return;
  }
}
