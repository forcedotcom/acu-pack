import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
import Utils from '../../../lib/utils';
import { Office } from '../../../lib/office';
import path = require('path');
import { SfdxPermission, ObjectDetail, FieldDetail, PermissionSet, MetadataDetail } from '../../../lib/sfdx-permission';
import SfdxProject from '../../../lib/sfdx-project';

export default class Permissions extends CommandBase {
  public static defaultReportPath = 'PermissionsReport.xlsx';
  // Order Matters here!
  public static defaultMetadataFolders = [
    '**/objects/*/*.object-meta.xml',
    '**/objects/*/fields/*.field-meta.xml',
    '**/permissionsets/*.permissionset-meta.xml',
    '**/profiles/*.profile-meta.xml'
  ];

  public static description = CommandBase.messages.getMessage('source.permissions.commandDescription');
  public static examples = [
    `$ sfdx acumen:source:permissions -u myOrgAlias
    Reads security information from source-formatted configuration files (${Permissions.defaultMetadataFolders.join(', ')}) located in default project source location and writes the '${Permissions.defaultReportPath}' report file.`,
  ];

  protected static flagsConfig = {
    source: flags.string({
      char: 'p',
      description: CommandBase.messages.getMessage('source.permissions.sourceFlagDescription'),
      required: false
    }),
    report: flags.string({
      char: 'r',
      description: CommandBase.messages.getMessage('source.permissions.reportFlagDescription', [Permissions.defaultReportPath]),
      required: false
    }),
    folders: flags.string({
      char: 'f',
      description: CommandBase.messages.getMessage('source.permissions.metadataFoldersFlagDescription', [Permissions.defaultMetadataFolders.join(', ')]),
      required: false
    })
  };

  protected static requiresProject = true;

  protected defaultReportHeaderName = '_HEADERS_';

  protected objectMetadata: Map<string, ObjectDetail>;
  protected fieldMetadata: Map<string, FieldDetail>;
  protected permissions: Map<string, PermissionSet>;
  protected reportHeaders: string[];

  public async run(): Promise<void> {
    if (!this.flags.source) {
      this.flags.source = (await SfdxProject.default()).getDefaultDirectory();
    }

    // Are we including namespaces?
    const folders = this.flags.folders
      ? this.flags.folders.split()
      : Permissions.defaultMetadataFolders;

    const originalCwd = Utils.setCwd(this.flags.source);
    const workbookMap = new Map<string, string[][]>();
    try {

      this.objectMetadata = new Map<string, ObjectDetail>();
      this.fieldMetadata = new Map<string, FieldDetail>();
      this.permissions = new Map<string, PermissionSet>();

      for (const folder of folders) {
        this.ux.log(`Scanning metadata in: ${folder}`);
        for await (const filePath of Utils.getFilesAsync(folder)) {
          const json = await Utils.readObjectFromXmlFile(filePath);
          if (json.CustomObject) {
            this.processObjectMeta(filePath, json);
          }
          if (json.CustomField) {
            this.processFieldMeta(filePath, json);
          }
          if (json.PermissionSet || json.Profile) {
            this.processPermissionSetMeta(filePath, json);
          }
        }
      }
      this.ux.log('Building Permissions Report');
      workbookMap.set('Objects', this.buildSheet('objectPermissions', this.objectMetadata));
      workbookMap.set('Fields', this.buildSheet('fieldPermissions', this.fieldMetadata));
      workbookMap.set('Users', this.buildSheet('userPermissions'));
      workbookMap.set('Apex Classes', this.buildSheet('classAccesses'));
      workbookMap.set('Apex Pages', this.buildSheet('pageAccesses'));
      workbookMap.set('Applications', this.buildSheet('applicationVisibilities'));
      workbookMap.set('Tabs', this.buildSheet('tabVisibilities'));
      workbookMap.set('Record Types', this.buildSheet('recordTypeVisibilities'));

    } catch (err) {
      throw err;
    } finally {
      if (originalCwd !== this.flags.source) {
        process.chdir(originalCwd);
      }
    }

    const reportPath = path.resolve(this.flags.report || Permissions.defaultReportPath);
    this.ux.log(`Writing Report: ${reportPath}`);

    Office.writeXlxsWorkbook(workbookMap, reportPath);

    this.ux.log('Done.');

    return;
  }

  protected buildSheet(permCollectionPropertyName: string, metadataDetails: Map<string, MetadataDetail> = null): string[][] {

    // Build map of metadata to permisisons
    const metaDataToPermissionsMap = new Map<string, string[][]>();
    for (const [permissionSetName, permissionSet] of this.permissions) {
      const permSetObject = permissionSet[`${permCollectionPropertyName}`] || [];
      // Add permissions for each metadata object
      for (const [apiName, perm] of permSetObject) {
        if (!metaDataToPermissionsMap.has(apiName)) {
          // create placeholders for missing metadata
          metaDataToPermissionsMap.set(apiName, []);
        }
        const sheetData = metaDataToPermissionsMap.get(apiName);
        sheetData.push([permissionSetName, SfdxPermission.getPermisionString(perm)]);
        metaDataToPermissionsMap.set(apiName, sheetData);
      }
    }

    const metaDataRows = new Map<string, string[][]>();
    const emptyMetadataRow = [];
    if (metadataDetails) {
      // Add metadata details to sheet first
      for (const [apiName, metaDataDetail] of metadataDetails) {
        const metadataData = metaDataToPermissionsMap.get(apiName);
        if (!metadataData) {
          continue;
        }
        const metadataArray: string[][] = [];
        for (const [key, value] of Object.entries(metaDataDetail)) {
          metadataArray.push([key, value]);
        }
        metaDataRows.set(apiName, metadataArray);
        if (emptyMetadataRow.length === 0) {
          for (const entry of metadataArray) {
            emptyMetadataRow.push([entry[0], '']);
          }
        }
      }
    }

    const workbookSheet: string[][] = [];

    const columns = ['API Name'];
    const typeRow = ['Type'];

    for (const entry of emptyMetadataRow) {
      columns.push(entry[0]);
      typeRow.push('');
    }
    for (const [permName, permSet] of this.permissions) {
      columns.push(permName);
      typeRow.push(permSet.isProfile ? 'Profile' : 'Permission Set');
    }

    // First row is just columns
    workbookSheet.push(columns);
    workbookSheet.push(typeRow);

    const rows = [columns[0], typeRow[0]];
    // Pre-populate rows with API Names
    for (const metadataName of metaDataToPermissionsMap.keys()) {
      // Init array to hold all columns
      const row = new Array(columns.length);
      // set metadata name as first column value
      row[0] = metadataName;

      const metadataValues = metaDataRows.get(metadataName) || emptyMetadataRow;
      for (let index = 0; index < metadataValues.length; index++) {
        row[index + 1] = metadataValues[index][1];
      }

      // Add row
      workbookSheet.push(row);
      // Store metadata name for lookup later
      rows.push(metadataName);
    }

    // We now have a matrix that we can begine to populate
    for (const [apiName, permDatas] of metaDataToPermissionsMap) {
      // Add one to row index to account for header row
      const rowIndex = rows.indexOf(apiName);
      // Compare to zero NOT -1 since we added one above....
      if (rowIndex === 0) {
        throw new Error(`Unable to find apiName:'${apiName}' in row collection`);
      }

      for (const permData of permDatas) {
        // Add one to col index to account for header row
        const colIndex = columns.indexOf(permData[0]);
        // Compare to zero NOT -1 since we added one above....
        if (colIndex === 0) {
          throw new Error(`Unable to find name:'${permData[0]}' in header collection`);
        }

        // Add data to matrix
        workbookSheet[rowIndex][colIndex] = permData[1];
      }
    }

    return workbookSheet;
  }

  protected getObjectDetails(name: string): ObjectDetail {
    return this.objectMetadata.get(name) || new ObjectDetail();
  }
  protected getFieldDetails(name: string): FieldDetail {
    return this.fieldMetadata.get(name) || new FieldDetail();
  }

  protected processObjectMeta(filePath: string, json: any) {
    const objectDetail = ObjectDetail.fromXml(filePath, json);
    this.objectMetadata.set(objectDetail.name, objectDetail);
  }

  protected processFieldMeta(filePath: string, json: any) {
    const fieldDetail = FieldDetail.fromXml(filePath, json);
    this.fieldMetadata.set(fieldDetail.name, fieldDetail);
  }

  protected processPermissionSetMeta(filePath: string, json: any) {
    const permSet = PermissionSet.fromXml(filePath, json);
    this.permissions.set(permSet.name, permSet);
  }
}
