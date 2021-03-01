import { CommandBase } from '../../../lib/command-base';
import { flags } from '@salesforce/command';
import { SfdxTasks } from '../../../lib/sfdx-tasks';
import { OptionsFactory } from '../../../lib/options-factory';
import { createWriteStream } from 'fs';
import { Office } from '../../../lib/office';
import Utils from '../../../lib/utils';
import SchemaUtils from '../../../lib/schema-utils';
import SchemaOptions from '../../../lib/schema-options';
import path = require('path');

export default class Dictionary extends CommandBase {
  public static description = CommandBase.messages.getMessage('schema.dictionary.commandDescription');

  public static defaultReportPath = 'DataDictionary-{ORG}.xlsx';

  public static examples = [
    `$ sfdx acumen:schema:dictionary -u myOrgAlias
    Generates a ${Dictionary.defaultReportPath.replace(/\{ORG\}/, 'myOrgAlias')} file from an Org's configured Object & Field metadata.`];

  protected static flagsConfig = {
    report: flags.string({
      char: 'r',
      description: CommandBase.messages.getMessage('schema.dictionary.reportFlagDescription', [Dictionary.defaultReportPath])
    }),
    namespaces: flags.string({
      char: 'n',
      description: CommandBase.messages.getMessage('namespacesFlagDescription')
    }),
    options: flags.string({
      char: 'o',
      description: CommandBase.messages.getMessage('schema.dictionary.optionsFlagDescription')
    })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  protected options: SchemaOptions;

  public async run(): Promise<void> {
    // Read/Write the options file if it does not exist already
    this.options = await OptionsFactory.get(SchemaOptions, this.flags.options);

    try {
      const orgAlias = this.flags.targetusername;
      const schemaTmpFile = `schema-${orgAlias}.tmp`;

      const sortedTypeNames = await this.getSortedTypeNames(orgAlias);

      // Create for writing - truncates if exists
      const fileStream = createWriteStream(schemaTmpFile, { flags: 'w' });

      let counter = 0;
      const schemas = new Set<string>();
      for (const metaDataType of sortedTypeNames) {
        this.ux.log(`Gathering (${++counter}/${sortedTypeNames.length}) ${metaDataType} schema...`);
        try {
          const schema = await SfdxTasks.describeObject(orgAlias, metaDataType);
          // Avoid duplicates (Account)
          if (schemas.has(schema.name)) {
            continue;
          }
          for (const name of this.options.outputDefMap.keys()) {
            fileStream.write(`*${name}\r\n`);
            const collection = schema[name];
            if (!collection) {
              continue;
            }
            const dynamicCode = this.options.getDynamicCode(name);
            for await (const row of SchemaUtils.getDynamicSchemaData(schema, dynamicCode, collection)) {
              if (row.length > 0) {
                fileStream.write(`${JSON.stringify(row)}\r\n`);
              }
            }
          }
          schemas.add(schema.name);
        } catch (err) {
          this.ux.log(`FAILED: ${err.message}.`);
        }
      }
      fileStream.end();

      try {
        const reportPath = (path.resolve(this.flags.report || Dictionary.defaultReportPath)).replace(/\{ORG\}/, orgAlias);
        this.ux.log(`Writing Report: ${reportPath}`);

        const workbookMap = new Map<string, string[][]>();
        let sheetName: string = null;
        let sheet: string[][] = null;
        for await (const line of Utils.readFileLines(schemaTmpFile)) {
          if (line.startsWith('*')) {
            sheetName = line.substring(1);
            const outputDefs = this.options.outputDefMap.get(sheetName);
            const headers = this.getColumnRow(outputDefs);
            sheet = workbookMap.get(sheetName);
            if (!sheet) {
              sheet = [[...headers]];
              workbookMap.set(sheetName, sheet);
            }
            continue;
          }
          sheet.push(JSON.parse(line));
        }
        Office.writeXlxsWorkbook(workbookMap, reportPath);

      } catch (err) {
        this.ux.log('Error Writing XLSX Report: ' + err.message);
        throw err;
      }

      this.ux.log('Done.');

      // Clean up file at end
      await Utils.deleteFile(schemaTmpFile);
    } catch (err) {
      throw err;
    }
  }

  private getColumnRow(outputDefs: string[]): string[] {
    const row = [];
    for (const outputDef of outputDefs) {
      row.push(outputDef.split('|')[0]);
    }
    return row;
  }

  private async getSortedTypeNames(orgAlias: string): Promise<string[]> {
    let typeNames: Set<string> = null;
    if (this.options.includeCustomObjectNames && this.options.includeCustomObjectNames.length > 0) {
      this.ux.log('Gathering CustomObject names from options');
      typeNames = new Set<string>(this.options.includeCustomObjectNames);
    } else {
      // Are we including namespaces?
      const namespaces = this.flags.namespaces
        ? new Set<string>(this.flags.namespaces.split())
        : new Set<string>();

      this.ux.log(`Gathering CustomObject names from Org: ${orgAlias}(${this.org.getOrgId()})`);
      const objectMap = await SfdxTasks.listMetadatas(orgAlias, ['CustomObject'], namespaces);
      typeNames = new Set<string>(objectMap.get('CustomObject'));
    }

    if (this.options.excludeCustomObjectNames) {
      this.options.excludeCustomObjectNames.forEach(item => typeNames.delete(item));
    }
    return Utils.sortArray(Array.from(typeNames));
  }
}
