import path = require('path');
import * as fs from 'fs';
import * as FormData from 'form-data';
import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
import { SfdxClient } from '../../../../lib/sfdx-client';
import Utils, { RestAction } from '../../../../lib/utils';

export default class post extends CommandBase {
  public static description = CommandBase.messages.getMessage('api.file.post.commandDescription');

  public static examples = [
    `$ sfdx acu-pack:api:file:post -u myOrgAlias -r ContentVersions.csv -f ./upload-files
    Uploads the ContentVersion records defined in ContentVersions.csv and uses the file located in ./upload-files.`,
  ];

  protected static flagsConfig = {
    records: flags.string({
      char: 'r',
      description: CommandBase.messages.getMessage('api.file.post.recordsFlagDescription'),
      required: true,
    }),
    folder: flags.string({
      char: 'f',
      description: CommandBase.messages.getMessage('api.file.post.fileFolderFlagDescription'),
    }),
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  protected async runInternal(): Promise<void> {
    if(!(await Utils.pathExists(this.flags.records))) {
      this.raiseError(`Path does not exists: ${this.flags.records as string}.`);
      return;
    }

    this.ux.log(this.flags.folder);
    if(this.flags.folder && !(await Utils.pathExists(this.flags.folder))) {
      this.raiseError(`Path does not exists: ${this.flags.folder as string}.`);
      return;
    }

    const sfdxClient = new SfdxClient(this.orgAlias);
    const errors= [];
    for await( const contentVersion of Utils.parseCSVFile(this.flags.records)) {
      const fileName: string = contentVersion.PathOnClient;
      const filePath: string = 'VersionData' in contentVersion
        ? contentVersion.VersionData 
        : path.join(this.flags.folder, contentVersion.PathOnClient);

      if(!(await Utils.pathExists(filePath))) {
        this.raiseError(`Path does not exists: ${filePath}.`);
        return;
      }
      const uri = await sfdxClient.getUri('ContentVersion');

      const data = fs.createReadStream(filePath);

      const form = new FormData();
      form.append('entity_content', JSON.stringify(contentVersion), {
        contentType: 'application/json',
      });
      form.append('VersionData', data, {
        filename: fileName,
        contentType: 'application/octet-stream',
      });

      const result = await Utils.getRestResult(
        RestAction.POST,
        uri,
        form,
        form.getHeaders({ Authorization: `Bearer ${this.connection.accessToken}` }),
        [200,201]
      );

      if(result.isError){
        errors.push(`Error uploading: ${filePath} (${result.code})=> ${result.body as string}\r\nForm Data: ${JSON.stringify(form)}`)
      } else {
        this.ux.log(`ContentVersion ${result.body.id as string} created for file: ${fileName}`)
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
}
