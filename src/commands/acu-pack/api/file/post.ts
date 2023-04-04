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

    if(this.flags.folder && !(await Utils.pathExists(this.flags.folder))) {
      this.raiseError(`Path does not exists: ${this.flags.folder as string}.`);
      return;
    }

    const sfdxClient = new SfdxClient(this.orgAlias);
    const errors= [];
    for await( const contentVersion of Utils.parseCSVFile(this.flags.records)) {
      const fileName = contentVersion.PathOnClient;
      // const filePath = path.join(this.flags.folder, contentVersion.PathOnClient);
      const filePath: string = 'VersionData' in contentVersion
        ? contentVersion.VersionData 
        : path.join(this.flags.folder, contentVersion.PathOnClient);
      delete contentVersion['VersionData'];

      if(!(await Utils.pathExists(filePath))) {
        this.raiseError(`Path does not exists: ${filePath}.`);
        return;
      }
      const uri = await sfdxClient.getUri('ContentVersion');

      const data = Buffer.from('PDF mock content', 'binary');
      // const data = fs.readFileSync(filePath);
      // const data = fs.createReadStream(filePath);

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
        form.getHeaders({ Authorization: `Bearer ${this.connection.accessToken}` })
      );

      if(result.isError){
        errors.push(`Error uploading: ${filePath} (${result.code})=> ${result.body as string}\r\nForm Data: ${JSON.stringify(form)}`)
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

  private async SubmitAsync(url: string, formData: FormData): Promise<string> {
    return new Promise((resolve, reject) => {
      formData.submit(url, (err, res) => {
        if (err) {
          return reject(new Error(err.message))
        }
  
        if (res.statusCode < 200 || res.statusCode > 299) {
          return reject(new Error(`HTTP status code ${res.statusCode}: ${res.statusMessage}`))
        }
  
        const body = []
        res.on('data', (chunk) => body.push(chunk))
        res.on('end', () => {
          const resString = Buffer.concat(body).toString()
          resolve(resString)
        })
      });
    })
  }
}
/*

/*
    const sfdxClient = new SfdxClient(this.orgAlias);
    const errors= [];
    fs.createReadStream('data.csv')
      .pipe(csv())
      .on('data', (contentVersion) =>  {
        if(!fs.existsSync(contentVersion.VersionData)) {
          errors.push(`Path does not exists: ${this.flags.folder as string}.`);
        } else {
          for await (const result of sfdxClient.do(RestAction.MULTIPARTPOST, 'ContentVersion', [contentVersion])) {
            if(result.isError){
              errors.push(`Error uploading: ${contentVersion.VersionData} (${result.code})=> ${result.body}`)
            }
          }

          const formData: {
            file: fs.createReadStream('sample.zip'),
            token: '### access token ###',
            filetype: 'zip',
            filename: 'samplefilename',
            channels: 'sample',
            title: 'sampletitle',
          };
 
        }
      })
      .on('end', () => {
      });
      if(errors.length>0) {
        this.ux.log('The following records failed:');
        for(const error of errors) {
          this.ux.log(error);
        }
        this.raiseError('Upload Failed');
        return;
      }

    const ids = this.flags.ids.split(',');
    for await (const response of sfdxClient.getByIds(this.flags.metadata, ids, ApiKind.DEFAULT)) {
      const outFilePath = this.flags.output || '{Id}.json';
      const content = response.getContent();
      if (response.isBinary) {
        await Utils.writeFile(outFilePath.replace('{Id}', response.id), content);
      } else {
        await Utils.writeFile(outFilePath.replace('{Id}', response.id), JSON.stringify(content));
      }
    }








const jsforce = require("jsforce");
const axios = require("axios");
var FormData = require("form-data");
const getStream = require("get-stream");
const mime = require("mime-types");
const conn = new jsforce.Connection({
  loginUrl: "https://login.salesforce.com",
});
const username = "";
const password = "";

const main = async () => {
  await conn.login(username, password);
  const sourceContentVersionFile =
    await conn.query(`SELECT Id, Title, ContentSize, VersionData, PathOnClient
                    FROM ContentVersion 
                    ORDER BY CreatedDate DESC
                    LIMIT 1`);
  const contentVersionRecord = sourceContentVersionFile.records[0];

  if (contentVersionRecord.ContentSize > 37000000) {
    // size greater than 37Mb use multipart blob insert.
    const fileStream = await getFile(contentVersionRecord, false);
    const formData = createFormData(contentVersionRecord, fileStream);
    const URL =
      conn.instanceUrl + "/services/data/v51.0/sobjects/ContentVersion";
    await axios({
      method: "post",
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      url: URL,
      headers: {
        Authorization: "Bearer " + conn.accessToken,
        "Content-Type": `multipart/form-data; boundary=\"boundary_string\"`,
      },
      data: formData,
    });
  } else {
    const base64Body = await getFile(contentVersionRecord, true);
    await conn.sobject("ContentVersion").insert({
      Title: contentVersionRecord.Title,
      PathOnClient: contentVersionRecord.PathOnClient,
      VersionData: base64Body,
      FirstPublishLocationId: "0012w00000rTbXNAA0", //Id to which the content version needs to be linked
      Origin: "H",
    });
  }
};

const getFile = async (data, generateBase64String) => {
  const file = await axios({
    method: "get",
    url: conn.instanceUrl + data.VersionData,
    headers: {
      Authorization: "Bearer " + conn.accessToken,
    },
    responseType: "stream",
  });
  if (generateBase64String) {
    return await getStream(file.data, { encoding: "base64" });
  } else {
    return file.data; // return the stream;
  }
};

const createFormData = (data, file) => {
  const contentVersion = {
    FirstPublishLocationId: "0012w00000rTbXNAA0",
    Title: data.Title,
    PathOnClient: data.PathOnClient,
    Origin: "H",
  };
  const form = new FormData();
  form.setBoundary("boundary_string");
  form.append("entity_content", JSON.stringify(contentVersion), {
    contentType: "application/json",
  });
  form.append("VersionData", file, {
    filename: data.PathOnClient,
    contentType: mime.lookup(data.PathOnClient),
  });
  return form;
};
main();
*/
