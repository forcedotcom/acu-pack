import { flags } from '@salesforce/command';
import { ErrorResult, RecordResult } from 'jsforce';
import { CommandBase } from '../../../../lib/command-base';
import { SfdxClient } from '../../../../lib/sfdx-client';
import Utils, { RestResult } from '../../../../lib/utils';
import Constants from '../../../../lib/constants';

export default class post extends CommandBase {

  public static readonly 

  public static description = CommandBase.messages.getMessage('api.file.post.commandDescription');

  public static examples = [
    `$ sfdx acu-pack:api:file:post -u myOrgAlias -m ContentVersion -r ContentVersions.csv
    Uploads the ContentVersion records defined in ContentVersions.csv. 
    NOTE: filename = PathOnClient, filePath = ContentVersion then PathOnClient`,
    `$ sfdx acu-pack:api:file:post -u myOrgAlias -m ContentVersion -r ContentVersions.csv -c ContentDocumentId,VersionData,PathOnClient
    Uploads the ContentVersion records defined in ContentVersions.csv using only the columns: ContentDocumentId,VersionData,PathOnClient. 
    NOTE: filename = PathOnClient, filePath = ContentVersion then PathOnClient`,
    `$ sfdx acu-pack:api:file:post -u myOrgAlias -m ContentVersion -r ContentVersions.csv -a
    Uploads the ContentVersion records defined in ContentVersions.csv. The whole process will stop on the first failure.
    NOTE: filename = PathOnClient, filePath = ContentVersion then PathOnClient`,
  ];
  
  protected static flagsConfig = {
    metadata: flags.string({
      char: 'm',
      description: CommandBase.messages.getMessage('api.file.post.metadataFlagDescription'),
      required: true,
    }),
    records: flags.string({
      char: 'r',
      description: CommandBase.messages.getMessage('api.file.post.recordsFlagDescription'),
      required: true,
    }),
    columns: flags.string({
      char: 'c',
      description: CommandBase.messages.getMessage('api.file.post.columnsFlagDescription'),
      required: false,
    }),
    allornothing: flags.boolean({
      char: 'a',
      description: CommandBase.messages.getMessage('api.file.post.allOrNothingFlagDescription'),
      required: false,
    }),
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  protected metadataInfo: any = null;

  protected async runInternal(): Promise<void> {
    const objectName = this.flags.metadata as string;
    this.metadataInfo = SfdxClient.metaDataInfo[objectName];
    const records: string = this.flags.records
    const columns: string[] = this.flags.columns ? this.flags.columns.split(',') : null;
    this.logger.debug('Executing api:file:post');

    this.logger.debug(`MetdataInfo: ${JSON.stringify(this.metadataInfo)}`);
    if(!this.metadataInfo) {
      this.raiseError(`MetaDataInfo not found for: ${objectName}.`);
      return;
    }

    this.logger.debug(`Records: ${records}`);
    if(!(await Utils.pathExists(records))) {
      this.raiseError(`Path does not exists: ${records}.`);
      return;
    }
    
    const sfdxClient = new SfdxClient(this.orgAlias);
    const errors= [];
    let counter = 0;
    for await( const recordRaw of Utils.parseCSVFile(records)) {
      if(errors.length > 0 && (this.flags.allornothing as boolean)) {
        break;
      }
      counter++;
      this.logger.debug(`RAW ${objectName} from CSV: ${JSON.stringify(recordRaw)}`);
      
      const record = this.sanitizeRecord(recordRaw, columns);
      const fileName: string = record[this.metadataInfo.Filename];
      const filePath: string = record[this.metadataInfo.DataName] ?? fileName;

      if(!filePath) {
        errors.push(`No file path found for record: ${JSON.stringify(record)}.`);
        continue;
      }

      if(!(await Utils.pathExists(filePath))) {
        this.raiseError(`Path does not exists: ${filePath}.`);
        return;
      }
      const stats = await Utils.getPathStat(filePath);

      // Do we need to use a multi-part POST?
      let result: RestResult = null;
      try {
        if (stats.size > Constants.CONENTVERSION_MAX_SIZE) {
          result = await sfdxClient.postObjectMultipart(objectName, record, fileName, filePath);
        } else {
          result = await this.postObject(objectName, record, filePath);
        }
      }
      catch(err) {
        result = new RestResult();
        result.code = 0;
        result.isError = true;
        result.body = `Exception: ${err.message as string}`;
      }
      if(result.isError){
        errors.push(`Error uploading: (${counter}) ${filePath} (${result.code}) => ${result.body as string}}`);
        this.logger.debug(`Error api:file:post failed: ${filePath} (${result.code})=> ${result.body as string}`);
      }
      this.ux.log(`(${counter}) ${objectName} ${result.isError ? 'FAILED' : result.id} for file: ${fileName}`);
    }

    if(errors.length > 0) {
      this.ux.log('The following records failed:');
      for(const error of errors) {
        this.ux.log(error);
      }
      this.raiseError('Upload Failed');
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  protected async postObject(objectName: string, objectRecord: any, filePath: string): Promise<any> {
    this.logger.debug(`POSTing: ${objectName} `);
    this.logger.debug(`POSTing: ${JSON.stringify(objectRecord)}`);
    const result: RestResult = new RestResult();
   
    const base64Body = await Utils.readFile(filePath, Utils.ReadFileBase64EncodingOption);
    objectRecord[this.metadataInfo.DataName] = base64Body;

    const postResult: RecordResult = await this.connection.sobject(objectName).insert(objectRecord);
    if(postResult.success) {
      result.id = postResult.id;
    } else {
      result.code = 400;
      result.body = JSON.stringify((postResult as ErrorResult).errors);
    }
    return result;
  }

  private sanitizeRecord(raw: any, columns: string[] = []): any {
    if(columns) {
      const newRaw = {};
      for( const column of columns) {
        if(column in raw) {
          newRaw[column] = raw[column];
        } else {
          this.raiseError(`The specified column/field ('${column}') does not exist in CSV record: ${JSON.stringify(raw)}`);
        }
      }
      const keys = Object.keys(raw);
      for( const key of keys) {
        if(columns.includes(key)) {
          continue;
        }
        delete raw[key];
      }  
    } else {
      for( const key of ['Id', 'FileType']) {
        if(key in raw) {
          delete raw[key];
        }
      }  
    }
    return raw;
  }
}
