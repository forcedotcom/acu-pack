import * as fs from 'fs';
import * as FormData from 'form-data';
import { flags } from '@salesforce/command';
import { ErrorResult, RecordResult } from 'jsforce';
import { CommandBase } from '../../../../lib/command-base';
import { SfdxClient } from '../../../../lib/sfdx-client';
import Utils, { RestAction, RestResult } from '../../../../lib/utils';
import Constants from '../../../../lib/constants';

export default class post extends CommandBase {

  public static readonly formDataInfo = {
    ContentVersion: {
      MetaName: 'entity_content',
      DataName: 'VersionData'
    },
    Document: {
      MetaName: 'entity_document',
      DataName: 'Document'
    },
  };

  public static readonly 

  public static description = CommandBase.messages.getMessage('api.file.post.commandDescription');

  public static examples = [
    `$ sfdx acu-pack:api:file:post -u myOrgAlias -r ContentVersions.csv
    Uploads the ContentVersion records defined in ContentVersions.csv. 
    NOTE: filename = PathOnClient, filePath = ContentVersion then PathOnClient`,
  ];
  
  protected static flagsConfig = {
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
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  protected async runInternal(): Promise<void> {
    const records: string = this.flags.records
    const columns: string[] = this.flags.columns ? this.flags.columns.split(',') : null;
    this.logger.debug('Executing api:file:post');

    this.logger.debug(`Records: ${records}`);
    if(!(await Utils.pathExists(records))) {
      this.raiseError(`Path does not exists: ${records}.`);
      return;
    }
    
    const errors= [];
    let counter = 0;
    for await( const contentVersionRaw of Utils.parseCSVFile(records)) {
      counter++;
      this.logger.debug(`RAW ContentVersion from CSV: ${JSON.stringify(contentVersionRaw)}`);
      
      const contentVersion = this.sanitizeContentVersion(contentVersionRaw, columns);
      const fileName: string = contentVersion.PathOnClient;
      const filePath: string = contentVersion.VersionData ?? fileName;

      if(!filePath) {
        errors.push(`No file path found for record: ${JSON.stringify(contentVersion)}.`);
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
          result = await this.postObjectMultipart('ContentVersion',contentVersion, fileName, filePath);
        } else {
          result = await this.postObject('ContentVersion',contentVersion, filePath);
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
      this.ux.log(`(${counter}) ContentVersion ${result.isError ? 'FAILED' : result.id} for file: ${fileName}`);
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
   
    const base64Body = await Utils.readFile(filePath, Utils.RedaFileBase64EncodingOption);
    objectRecord.VersionData = base64Body;

    const postResult: RecordResult = await this.connection.sobject(objectName).insert(objectRecord);
    if(postResult.success) {
      result.id = postResult.id;
    } else {
      result.code = 400;
      result.body = JSON.stringify((postResult as ErrorResult).errors);
    }
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  protected async postObjectMultipart(objectName: string, objectRecord: any, fileName: string, filePath: string): Promise<any> {
    this.logger.debug(`multi-part-POSTing: ${objectName} `);
    this.logger.debug(`multi-part-POSTing: ${JSON.stringify(objectRecord)}`);

    const form = new FormData();
    const formContent = JSON.stringify(objectRecord);

    const metaName = post.formDataInfo[objectName].MetaName;
    form.append(metaName, formContent, {
      contentType: Constants.MIME_JSON,
    });

    const dataName = post.formDataInfo[objectName].DataName;
    const data = fs.createReadStream(filePath);
    form.append(dataName, data, {
      filename: fileName,
      contentType: Utils.getMIMEType(fileName), // 'application/octet-stream',
    });

    this.logger.debug(`POSTing: ${fileName}`);

    const sfdxClient = new SfdxClient(this.orgAlias);
    const uri = await sfdxClient.getUri(objectName);
    const result = await Utils.getRestResult(
      RestAction.POST,
      uri,
      form,
      form.getHeaders({ Authorization: `Bearer ${this.connection.accessToken}` }),
      [200,201]
    );

    // Log the form data if an error occurs
    if(result.isError){
      this.logger.debug(`Error api:file:post failed: ${filePath} (${result.code})=> ${result.body as string}${Constants.EOL}Form Data: ${JSON.stringify(form)}`);
    } else {
      result.id = result.body.id;
    }
    return result;
  }

  private sanitizeContentVersion(raw: any, columns: string[] = []): any {
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
