import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
import Utils from '../../../lib/utils';
import path = require('path');
import { SfdxPermission, PermissionSet } from '../../../lib/sfdx-permission';
import { SfdxTasks } from '../../../lib/sfdx-tasks';

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

  protected static requiresProject = false;
  protected static requiresUsername = true;

  protected permissions: Map<string, PermissionSet>;

  public async run(): Promise<void> {
    const sourceFolders = !this.flags.source
      ? Profile.defaultPermissionsGlobs
      : this.flags.source.split(',');

    this.permissions = new Map<string, PermissionSet>();
    let gotStandardTabs = false;

    const sourceFilePaths = new Set<string>();
    const custObjs = [];
    for (const sourceFolder of sourceFolders) {
      if (!sourceFolder) {
        continue;
      }
      this.ux.log(`Reading metadata in: ${sourceFolder}`);
      for await (const filePath of Utils.getFiles(sourceFolder.trim())) {
        this.ux.log(`\tProcessing: ${filePath}`);
        const json = await Utils.readObjectFromXmlFile(filePath);

        if (!json.PermissionSet && !json.Profile) {
          this.ux.log(`\tUnable to process file: ${filePath}`);
          continue;
        }
        // Read all the CustomObject typenames PermissionSet from and add to the customObjects Set
        const permSet = PermissionSet.fromXml(filePath, json);
        custObjs.push(...Array.from(permSet.getPermissionCollection(SfdxPermission.customObject).keys()));

        // Add to collection for update later
        sourceFilePaths.add(filePath);
      }
    }
    // Debug
    const customObjects = new Set<string>(Utils.sortArray(custObjs));
    this.ux.log(`CustomObjects: ${customObjects}`);

    // Get Objects and fields first
    const notFoundInOrg = new Set<string>();
    let custFields = [];
    let counter = 0;
    for (const customObject of customObjects) {
      this.ux.log(`Gathering (${++counter}/${customObjects.size}) ${customObject} schema...`);
      try {
        const objMeta = await SfdxTasks.describeObject(this.orgAlias, customObject);
        for (const field of objMeta.fields) {
          custFields.push(`${customObject}.${field.name}`);
        }
      } catch (ex) {
        this.ux.log(`Error Gathering ${customObject} schema: ${ex.message}`);
        notFoundInOrg.add(customObject);
      }
    }
    custFields = Utils.sortArray(custFields);
    const customFields = new Set<string>(custFields);
    // Debug
    this.ux.log(`CustomFields: ${custFields}`);

    // Now get rest - and skip Objects & Fields
    const orgMetaDataMap = new Map<string, Set<string>>();
    orgMetaDataMap.set(SfdxPermission.customObject, customObjects);
    orgMetaDataMap.set(SfdxPermission.customField, customFields);

    this.ux.log(`${SfdxPermission.defaultPermissionMetaTypes}`);
    for (const permissionMetaDataType of SfdxPermission.defaultPermissionMetaTypes) {
      switch (permissionMetaDataType) {
        case SfdxPermission.customObject:
        case SfdxPermission.customField:
          continue;
        default:
          const nameSet = new Set<string>();
          for await(const metaData of SfdxTasks.listMetadata(this.orgAlias, permissionMetaDataType)) {
            if (!metaData.fullName) {
              this.ux.log(`Error No fullName field on type ${permissionMetaDataType}`);
              continue;
            }
            nameSet.add(metaData.fullName);
          }
          orgMetaDataMap.set(permissionMetaDataType, nameSet);
      }
    }

    // Now run back through Permission files and determine if anything is missing in Org
    counter = 0;

    for (const sourceFilePath of sourceFilePaths) {
      const permSetErrors = [];
      const permSetStandardTabs = [];
      this.ux.log(`Verifying (${++counter}/${sourceFilePaths.size}) ${sourceFilePath} schema...`);
      const json = await Utils.readObjectFromXmlFile(sourceFilePath);
      const permSet = PermissionSet.fromXml(sourceFilePath, json);

      for (const metadataName of SfdxPermission.defaultPermissionMetaTypes) {
        const permCollection = permSet.getPermissionCollection(metadataName);
        if (!permCollection) {
          switch (metadataName) {
              case SfdxPermission.profile:
              case SfdxPermission.permissionSet:
                // These items are not found in the Profile or PermissionSet XML
                continue;
            default:
              permSetErrors.push(`WARNING: No Permission entries found for ${metadataName}.`);
              break;
          }
          continue;
        }
        let permSetExistingNames = [];
        switch (metadataName) {
          case SfdxPermission.customTab:
            if (permSet.tabVisibilities) {
              for (const [tabName, tabPerm] of permCollection) {
                if (tabPerm['isStandard']) {
                  // Standard Tabs are not exposed via the Metadata API
                  permSetStandardTabs.push(tabName);
                  gotStandardTabs = true;
                  continue;
                }
                permSetExistingNames.push(tabName);
              }
            }
            break;
          default:
            permSetExistingNames = Array.from(permCollection.keys());
            break;
        }
        for (const permSetExistingName of permSetExistingNames) {
          const orgTypeNames = orgMetaDataMap.get(metadataName);
          if (!orgTypeNames.has(permSetExistingName)) {
            if (!notFoundInOrg.has(permSetExistingName.split('.')[0])) {
              permSetErrors.push(`${permSetExistingName} NOT visible/found in Org.`);
            }
          }
        }
      }

      if (permSetStandardTabs.length > 0) {
        for (const standardTab of permSetStandardTabs) {
          permSetErrors.push(`\t${standardTab} (*)`);
        }
      }
      if (permSetErrors.length > 0) {
        this.ux.log('Warnings & Errors:');
        for (const error of permSetErrors) {
          this.ux.log(`\t\t${error}`);
        }
      }
      if (notFoundInOrg.size > 0) {
        this.ux.log('Objects Not Visible/Found:');
        for (const notFound of notFoundInOrg) {
          this.ux.log(`\t\t${notFound}`);
        }
      }

      if (this.flags.modify) {
        /*
        const outFilePath = this.flags.output
          ? path.join(this.flags.output, filePath)
          : filePath;

        this.ux.log(`\tUpdating: ${outFilePath}`);
        await Utils.writeObjectToXmlFile(outFilePath, newPermSet.toXmlObj());
        */
      }
    }

    if (gotStandardTabs) {
      this.ux.log('(*) WARNING: Standard Tab permissions detected.');
      this.ux.log('Salesforce does not expose Standard Tabs via the Metadata API.');
      this.ux.log(`Compatibility with '${this.orgAlias}' can only be ensured if these permissions are removed.`);
    }

    this.ux.log('Done.');

    return;
  }
}
