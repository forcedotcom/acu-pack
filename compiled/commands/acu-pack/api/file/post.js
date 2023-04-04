"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const fs = require("fs");
const FormData = require("form-data");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const sfdx_client_1 = require("../../../../lib/sfdx-client");
const utils_1 = require("../../../../lib/utils");
class post extends command_base_1.CommandBase {
    async runInternal() {
        var e_1, _a;
        if (!(await utils_1.default.pathExists(this.flags.records))) {
            this.raiseError(`Path does not exists: ${this.flags.records}.`);
            return;
        }
        if (!(await utils_1.default.pathExists(this.flags.folder))) {
            this.raiseError(`Path does not exists: ${this.flags.folder}.`);
            return;
        }
        const sfdxClient = new sfdx_client_1.SfdxClient(this.orgAlias);
        const errors = [];
        try {
            for (var _b = tslib_1.__asyncValues(utils_1.default.parseCSVFile(this.flags.records)), _c; _c = await _b.next(), !_c.done;) {
                const contentVersion = _c.value;
                const fileName = contentVersion.PathOnClient;
                const filePath = path.join(this.flags.folder, contentVersion.PathOnClient);
                if (!(await utils_1.default.pathExists(filePath))) {
                    this.raiseError(`Path does not exists: ${filePath}.`);
                    return;
                }
                const form = new FormData();
                form.setBoundary('boundary_string');
                form.append('entity_content', JSON.stringify(contentVersion), {
                    contentType: 'application/json',
                });
                form.append('VersionData', fs.createReadStream(filePath), {
                    filename: fileName,
                    contentType: contentVersion.FileType,
                });
                const uri = await sfdxClient.getUri('ContentVersion');
                const result = await utils_1.default.getRestResult(utils_1.RestAction.POST, uri, null, form.getHeaders());
                if (result.isError) {
                    errors.push(`Error uploading: ${filePath} (${result.code})=> ${result.body}`);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
}
exports.default = post;
post.description = command_base_1.CommandBase.messages.getMessage('api.file.post.commandDescription');
post.examples = [
    `$ sfdx acu-pack:api:file:post -u myOrgAlias -f ContentVersions.csv -f ./upload-files
    Uploads the ContentVersion records defined in ContentVersions.csv and uses the file located in ./upload-files.`,
];
post.flagsConfig = {
    records: command_1.flags.string({
        char: 'r',
        description: command_base_1.CommandBase.messages.getMessage('api.file.post.recordsFlagDescription'),
        required: true,
    }),
    folder: command_1.flags.string({
        char: 'f',
        description: command_base_1.CommandBase.messages.getMessage('api.file.post.fileFolderFlagDescription'),
    }),
};
// Comment this out if your command does not require an org username
post.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
post.requiresProject = false;
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
//# sourceMappingURL=post.js.map