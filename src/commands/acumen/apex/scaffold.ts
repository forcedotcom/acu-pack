import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
import { OptionsFactory } from '../../../lib/options-factory';
import Utils from '../../../lib/utils';
import { ScaffoldOptions } from '../../../lib/scaffold-options';
import SfdxProject from '../../../lib/sfdx-project';
import { SfdxTasks } from '../../../lib/sfdx-tasks';

export default class Scaffold extends CommandBase {
  public static description = CommandBase.messages.getMessage('apex.scaffold.commandDescription');

  public static examples = [
    `$ sfdx apex.scaffold -u myOrgAlias -s Account,MyObject__c'
    Generates AccountTest.cls & MyObjectTest.cls Apex test classes (and cls-meta files) for the Account & MyObject__c SObject types. Random values assigned to required fields by default`,
    `$ sfdx apex.scaffold -u myOrgAlias -o scaffold-options.json
    Generates Apex test classes (and cls-meta files) for specified CustomObjects. The specified options file is used.`
  ];

  protected static flagsConfig = {
    sobjects: flags.string({
      char: 's',
      description: CommandBase.messages.getMessage('apex.scaffold.sObjectsFlagDescription')
    }),
    options: flags.string({
      char: 'o',
      description: CommandBase.messages.getMessage('apex.scaffold.optionsFlagDescription')
    })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  private static META_XML = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">\n' +
    '<apiVersion>API_VERSION_TOKEN</apiVersion>\n' +
    '<status>Active</status>\n' +
    '</ApexClass>';

  private static MAX_CLASS_NAME_LENGTH = 40;
  private orgAlias: string;
  private schemas = new Map<string, any>();

  public async run(): Promise<void> {

    let options: ScaffoldOptions;
    // Read/Write the options file if it does not exist already
    if (this.flags.options) {
      options = await OptionsFactory.get(ScaffoldOptions, this.flags.options);
      if (!options) {
        this.ux.log(`Unable to read options file: ${this.flags.options}.`);
        // Set the proper exit code to indicate violation/failure
        process.exitCode = 1;
        return;
      }
    } else {
      options = new ScaffoldOptions();
      await options.loadDefaults();
    }

    if (this.flags.sobjects) {
      options.sObjectTypes.push(...this.flags.sobjects.split('.'));
    }

    this.orgAlias = this.flags.targetusername;
    const orgId = this.org.getOrgId();

    try {
      this.ux.log(`Connecting to Org: ${this.orgAlias}(${orgId})`);

      this.ux.log('Retrieving Schemas...');
      for (const sObjectType of options.sObjectTypes) {
        await this.getSchema(sObjectType);
      }

      this.ux.log('Reading ./sfdx-project.json file...');
      const project = await SfdxProject.default();
      const defaultFolder = project.getDefaultDirectory();

      this.ux.log('Generating Apex cls & cls-meta files...');

      const rootPath = `./${defaultFolder}/main/default/classes/`;
      for (const [schemaName, schema] of this.schemas) {
        this.ux.log('\t' + schemaName);
        const fileDetails = this.generateTestSetupCode(schemaName, schema);

        await Utils.writeFile(
          rootPath + `${fileDetails.name}.cls`,
          fileDetails.contents);

        await Utils.writeFile(
          rootPath + `${fileDetails.name}.cls-meta.xml`,
          Scaffold.META_XML.replace(/API_VERSION_TOKEN/, project.sourceApiVersion));
      }

    } catch (err) {
      process.exitCode = 1;
      throw err;
    } finally {
      this.ux.log('Done.');
    }
  }
  private async getSchema(sObjectType: string): Promise<any> {
    let schema = this.schemas.get(sObjectType);
    if (!schema) {
      schema = await SfdxTasks.describeObject(this.orgAlias, sObjectType);
      if (!schema) {
        throw new Error('The returned schema is null.');
      }
      if (!schema.fields) {
        throw new Error('The returned schema does not contain a fields member.');
      }
      this.schemas.set(schema.name.split('__')[0], schema);
    }
    return schema;
  }

  private generateTestSetupCode(simpleName: string, schema: any): any {
    // Don't exceed max class name length
    const varName = simpleName.replace(/_/g, '');
    const className = `${varName.substring(0, Scaffold.MAX_CLASS_NAME_LENGTH - 4)}Test`;
    const pre = '\t\t\t';
    const classLines = [
      '// This class was generated by the acumen:apex:scaffold command.',
      '@IsTest',
      `public class ${className} {`,
      '',
      '\t@TestSetup',
      '\tstatic void setupTestData() {',
      `\t\t// Create instance`,
      `\t\t${schema.name} ${varName} = new ${schema.name}( `
    ];

    const codeLines = new Map<string, string>();
    for (const field of schema.fields) {
      if (!field.createable) {
        console.debug('Skipping: ' + field.name);
        continue;
      }
      codeLines.set(field.name, `${pre}${field.name} = ${this.generateFieldValue(field)}`);
    }

    const sortedKeys = Utils.sortArray(Array.from(codeLines.keys()));
    for (const key of sortedKeys) {
      let classLine = codeLines.get(key);
      if (key != sortedKeys[sortedKeys.length - 1]) {
        classLine += ',';
      }
      classLines.push(classLine);
    }

    classLines.push(...[
      '\t\t);',
      '\t}',
      '}'
    ]);
    return {
      name: className,
      contents: classLines.join('\n')
    };
  }

  private generateFieldValue(field: any): string {
    // https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_variables_global_objecttype_schema_fields_reference.htm
    if (!field) {
      throw new Error('The field argument cannot be null.');
    }

    const now = new Date();
    const simpleName = field.name.split('__')[0];
    let len = 0;
    if (field.length > 0) {
      len = field.length;
    } else if (field.precision > 0) {
      len = field.precision;
    }

    const getStr = (fld: any, lgth?: number): string => {
      if (!fld) {
        throw new Error('The fld argument cannot be null.');
      }

      let value = fld.name;
      const strLen = lgth ?? len;

      // trim if we are too long
      if (strLen && value.length > strLen) {
        return value.substr(0, len);
      }
      // if we specified a length - make sure we are that long
      if (lgth) {
        while (value.length < lgth) {
          value += get1Rand();
        }
      }
      return `'${value}'`;
    };

    const getDec = (fld: any): string => {
      if (!fld) {
        throw new Error('The fld argument cannot be null.');
      }

      let num = '';
      const scale = fld.scale ?? 0;
      for (let index = 1; index <= (len - scale); index++) {
        num += get1Rand();
      }
      if (fld.scale > 0) {
        num += '.';
        for (let index = 1; index <= scale; index++) {
          num += get1Rand();
        }
      }
      return num;
    };

    const getRand = (min: number, max: number): number => {
      return Math.floor(Math.random() * (max - min) + min);
    };

    const get1Rand = (): number => {
      return getRand(0, 9);
    };

    const getValue = (fld: any): string => {
      if (!fld) {
        throw new Error('The fld argument cannot be null.');
      }
      //this.ux.log(`Processing: ${fld.name} (${fld.type})`);
      switch (fld.type) {
        case 'anytype':
        case 'string':
        case 'encryptedString':
        case 'textarea':
          return getStr(fld);

        case 'base64':
          return Buffer.from(getStr(fld)).toString('base64');
        case 'textarea1':
          const lineCount = 3;
          // Calculate length of each line (subract for \n) then divide
          const lineLength = Math.floor((len - lineCount) / 3);
          const lines = [];
          for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
            lines.push(`${getStr(fld, lineLength)}`);
          }
          return lines.join('+\n');
        case 'int':
        case 'integer':
        case 'long':
        case 'double':
        case 'percent':
          return `${getDec(fld)}`;

        case 'currency':
          return `${getDec(fld)}`;

        case 'address':
          return `'123 ${fld.name} St.'`;

        case 'boolean':
          return `${(now.getTime() % 2) > 0 ? 'true' : 'false'}`;

        case 'date':
          return 'Date.today()';

        case 'datetime':
          return 'Datetime.now()';

        case 'time':
          return 'Datetime.getTime()';

        case 'email':
          return `'user@${simpleName}.com.${this.orgAlias}'`;

        case 'phone':
          return `'555-${getRand(100, 999)}-${getRand(1000, 9999)} ext ${fld.name}'`;

        case 'picklist':
          if (fld.picklistValues?.length == 0) {
            this.ux.log(`Skipping: ${fld.name} (${fld.type}) - no picklist values.`);
          }
          const index = getRand(0, fld.picklistValues.length);
          for (const picklist of fld.picklistValues.slice(index)) {
            if (!picklist.active) {
              continue;
            }
            return `'${picklist.value}'`;
          }
          return `null`;

        case 'url':
          return `'https://www.${simpleName}.salesforce.com.${this.orgAlias}/index'`;

        case 'id':
        case 'reference':
        case 'combobox':
        case 'dataCategoryGroupReference':
        case 'multipicklist':
        default:
          this.ux.log(`Skipping: ${fld.name} (${fld.type})`);
          return null;
      }
    };
    return getValue(field);
  }
}
