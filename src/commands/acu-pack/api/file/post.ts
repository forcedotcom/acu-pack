import * as fs from 'fs';
import * as FormData from 'form-data';
import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
import { SfdxClient } from '../../../../lib/sfdx-client';
import Utils, { RestAction } from '../../../../lib/utils';
import Constants from '../../../../lib/constants';

export default class post extends CommandBase {
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
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  protected async runInternal(): Promise<void> {
    const records: string = this.flags.records

    this.logger.debug('Executing api:file:post');

    this.logger.debug(`Records: ${records}`);
    if(!(await Utils.pathExists(records))) {
      this.raiseError(`Path does not exists: ${records}.`);
      return;
    }

    const sfdxClient = new SfdxClient(this.orgAlias);
    const errors= [];
    for await( const contentVersionRaw of Utils.parseCSVFile(records)) {
      this.logger.debug(`RAW ContentVersion from CSV: ${JSON.stringify(contentVersionRaw)}`);

      const contentVersion = this.sanitizeContentVersion(contentVersionRaw);
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
      const uri = await sfdxClient.getUri('ContentVersion');

      const data = fs.createReadStream(filePath);

      const form = new FormData();
      const formContent = JSON.stringify(contentVersion);
      form.append('entity_content', formContent, {
        contentType: 'application/json',
      });
      form.append('VersionData', data, {
        filename: fileName,
        contentType: 'application/octet-stream',
      });

      this.logger.debug(`POSTing: ${fileName}`);
      const result = await Utils.getRestResult(
        RestAction.POST,
        uri,
        form,
        form.getHeaders({ Authorization: `Bearer ${this.connection.accessToken}` }),
        [200,201]
      );

      if(result.isError){
        errors.push(`Error uploading: ${filePath} (${result.code}) => ${result.body as string}}${Constants.EOL}${formContent}`);
        this.logger.debug(`Error api:file:post failed: ${filePath} (${result.code})=> ${result.body as string}\r\nForm Data: ${JSON.stringify(form)}`);
      } else {
        this.ux.log(`ContentVersion ${result.body.id as string} created for file: ${fileName}`);
      }
    }
    if(errors.length > 0) {
      this.ux.log('The following records failed:');
      for(const error of errors) {
        this.ux.log(error);
      }
      this.raiseError('Upload Failed');
    }
  }

  private sanitizeContentVersion(raw: any): any {
    const removeProps = ['Id', 'FileType'];
    for( const prop of removeProps) {
      if(prop in raw) {
        delete raw[prop];
      }
    }
    return raw;
  }
}
