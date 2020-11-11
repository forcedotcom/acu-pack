"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ts_types_1 = require("@salesforce/ts-types");
const sfdx_core_1 = require("./sfdx-core");
const path = require("path");
const package_options_1 = require("../lib/package-options");
const utils_1 = require("../lib/utils");
const fs_1 = require("fs");
const fs_2 = require("fs");
const sfdx_query_1 = require("./sfdx-query");
const xpath_options_1 = require("../lib/xpath-options");
class SfdxJobInfo {
    constructor() {
        this.statusCount = 0;
        this.maxStatusCount = 0;
    }
    isDone() {
        // Holding1, Queued, Preparing, Processing, Aborted, Completed,Failed
        return this.state === 'Aborted' || this.state === 'Completed' || this.state === 'Failed' || this.state === 'Closed';
    }
}
exports.SfdxJobInfo = SfdxJobInfo;
class SfdxOrgInfo {
    constructor(result) {
        this.username = result.username;
        this.id = result.id;
        this.connectedStatus = result.connectedStatus;
        this.accessToken = result.accessToken;
        this.instanceUrl = result.instanceUrl;
        this.clientId = result.clientId;
        this.alias = result.alias;
    }
}
exports.SfdxOrgInfo = SfdxOrgInfo;
class SfdxResult {
    constructor(result) {
        this.id = result.id;
        this.success = result.success;
        this.errors = result.errors;
    }
}
exports.SfdxResult = SfdxResult;
class SfdxTasks {
    static async describeMetadata(usernameOrAlias) {
        const response = await sfdx_core_1.SfdxCore.command(`sfdx force:mdapi:describemetadata --json -u ${usernameOrAlias}`);
        return !response || !response.metadataObjects
            ? []
            : ts_types_1.ensureArray(response.metadataObjects);
    }
    static async retrievePackage(usernameOrAlias, packageFilePath = 'manifest/package.xml') {
        // get custom objects
        return await sfdx_core_1.SfdxCore.command(`sfdx force:source:retrieve --json -x ${packageFilePath} -u ${usernameOrAlias}`);
    }
    static async initializeProject(projectName) {
        return await sfdx_core_1.SfdxCore.command(`sfdx force:project:create --projectname ${projectName}`);
    }
    static getTypesForPackage(usernameOrAlias, describeMetadatas, namespaces = null) {
        return tslib_1.__asyncGenerator(this, arguments, function* getTypesForPackage_1() {
            var e_1, _a, e_2, _b, e_3, _c;
            let folderPathMap;
            for (const describeMetadata of describeMetadatas) {
                const members = [];
                if (!describeMetadata.inFolder) {
                    try {
                        for (var _d = tslib_1.__asyncValues(this.listMetadata(usernameOrAlias, describeMetadata.xmlName, namespaces)), _e; _e = yield tslib_1.__await(_d.next()), !_e.done;) {
                            const result = _e.value;
                            members.push(result.fullName);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_e && !_e.done && (_a = _d.return)) yield tslib_1.__await(_a.call(_d));
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                else {
                    const folderMetaName = describeMetadata.xmlName === sfdx_core_1.SfdxCore.EMAIL_TEMPLATE_XML_NAME
                        ? sfdx_core_1.SfdxCore.EMAIL_TEMPLATE_XML_NAME
                        : `${describeMetadata.xmlName}Folder`;
                    // Get SOQL folder data (ONCE!)
                    if (!folderPathMap) {
                        folderPathMap = yield tslib_1.__await(this.getFolderSOQLDataAsync(usernameOrAlias));
                    }
                    try {
                        // Iterate all the folder metas
                        for (var _f = tslib_1.__asyncValues(this.listMetadata(usernameOrAlias, folderMetaName, namespaces)), _g; _g = yield tslib_1.__await(_f.next()), !_g.done;) {
                            const folderMeta = _g.value;
                            // Set the parent Id (used for nested folders)
                            // Salesforce does not return the full path in the metadada
                            //
                            const folderPath = folderPathMap.has(folderMeta.id)
                                ? folderPathMap.get(folderMeta.id)
                                : folderMeta.fullName;
                            // Add the meta for just the folder
                            members.push(folderPath);
                            try {
                                for (var _h = tslib_1.__asyncValues(this.listMetadataInFolder(usernameOrAlias, describeMetadata.xmlName, folderMeta.fullName)), _j; _j = yield tslib_1.__await(_h.next()), !_j.done;) {
                                    const inFolderMetadata = _j.value;
                                    // Add the meta for the item in the folder
                                    members.push([folderPath, path.basename(inFolderMetadata.fullName)].join('/'));
                                }
                            }
                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                            finally {
                                try {
                                    if (_j && !_j.done && (_c = _h.return)) yield tslib_1.__await(_c.call(_h));
                                }
                                finally { if (e_3) throw e_3.error; }
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_g && !_g.done && (_b = _f.return)) yield tslib_1.__await(_b.call(_f));
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
                yield yield tslib_1.__await({ name: describeMetadata.xmlName, members });
            }
        });
    }
    static async listMetadatas(usernameOrAlias, metadataTypes, namespaces = null) {
        const response = new Map();
        for (const metadataType of metadataTypes) {
            const results = await sfdx_core_1.SfdxCore.command(`sfdx force:mdapi:listmetadata --json -m ${metadataType} -u ${usernameOrAlias}`);
            // If there are no instances of the metadatatype SFDX just returns {status:0}
            const members = [];
            if (results) {
                for (const result of results) {
                    // If we have a metadata namespace AND
                    //  We are excluding namespaces OR
                    //  The list of allowed namespaces does not include the metdata namespace
                    // Continue.
                    if (result.namespacePrefix && (!namespaces || !namespaces.has(result.namespacePrefix))) {
                        continue;
                    }
                    members.push(result.fullName);
                }
            }
            response.set(metadataType, members);
        }
        return response;
    }
    static listMetadata(usernameOrAlias, metadataType, namespaces = null) {
        return tslib_1.__asyncGenerator(this, arguments, function* listMetadata_1() {
            const results = yield tslib_1.__await(sfdx_core_1.SfdxCore.command(`sfdx force:mdapi:listmetadata --json -m ${metadataType} -u ${usernameOrAlias}`));
            // If there are no instances of the metadatatype SFDX just returns {status:0}
            if (results) {
                let resultsArray;
                try {
                    resultsArray = ts_types_1.ensureArray(results);
                }
                catch (_a) {
                    resultsArray = [results];
                }
                for (const result of resultsArray) {
                    // If we have a metadata namespace AND
                    //  We are excluding namespaces OR
                    //  The list of allowed namespaces does not include the metdata namespace
                    // Continue.
                    if (result.namespacePrefix && (!namespaces || !namespaces.has(result.namespacePrefix))) {
                        continue;
                    }
                    yield yield tslib_1.__await(result);
                }
            }
        });
    }
    static listMetadataInFolder(usernameOrAlias, metadataType, folderName, namespaces = null) {
        return tslib_1.__asyncGenerator(this, arguments, function* listMetadataInFolder_1() {
            const results = yield tslib_1.__await(sfdx_core_1.SfdxCore.command(`sfdx force:mdapi:listmetadata --json -m ${metadataType} --folder ${folderName} -u ${usernameOrAlias}`));
            // If there are no instances of the metadatatype SFDX just returns {status:0}
            if (results) {
                let resultsArray;
                try {
                    resultsArray = ts_types_1.ensureArray(results);
                }
                catch (_a) {
                    resultsArray = [results];
                }
                for (const result of resultsArray) {
                    // If we have a metadata namespace AND
                    //  We are excluding namespaces OR
                    //  The list of allowed namespaces does not include the metdata namespace
                    // Continue.
                    if (result.namespacePrefix && (!namespaces || !namespaces.has(result.namespacePrefix))) {
                        continue;
                    }
                    yield yield tslib_1.__await(result);
                }
            }
        });
    }
    static async getPackageOptionsAsync(optionsPath) {
        let options;
        if (optionsPath) {
            if (await utils_1.default.pathExistsAsync(optionsPath)) {
                options = await sfdx_core_1.SfdxCore.fileToJson(optionsPath);
            }
            else {
                options = new package_options_1.PackageOptions();
                // load the default values
                options.loadDefaults();
                const dir = path.dirname(optionsPath);
                if (dir) {
                    await fs_1.promises.mkdir(dir, { recursive: true });
                }
                await sfdx_core_1.SfdxCore.jsonToFile(options, optionsPath);
            }
        }
        return options;
    }
    static async describeObject(usernameOrAlias, objectName) {
        return await sfdx_core_1.SfdxCore.command(`sfdx force:schema:sobject:describe --json -s ${objectName} -u ${usernameOrAlias}`);
    }
    static async getXPathOptionsAsync(optionsPath) {
        let options;
        if (optionsPath) {
            if (await utils_1.default.pathExistsAsync(optionsPath)) {
                const data = (await fs_1.promises.readFile(optionsPath)).toString();
                options = xpath_options_1.XPathOptions.deserialize(data);
            }
            else {
                options = new xpath_options_1.XPathOptions();
                // load the default values
                options.loadDefaults();
                const dir = path.dirname(optionsPath);
                if (dir) {
                    await fs_1.promises.mkdir(dir, { recursive: true });
                }
                await fs_1.promises.writeFile(optionsPath, options.serialize());
            }
        }
        return options;
    }
    static async enqueueApexTestsAsync(usernameOrAlias, sfdxEntities, shouldSkipCodeCoverage = false) {
        if (!usernameOrAlias || !sfdxEntities) {
            return null;
        }
        const tempFileName = 'apexTestQueueItems.csv';
        // Create the file for the bulk upsert
        // Create for writing - truncates if exists
        const stream = fs_2.openSync(tempFileName, 'w');
        // NOTE: Do NOT include spaces between fields...results in an error
        fs_2.writeSync(stream, 'ApexClassId,ShouldSkipCodeCoverage\r\n');
        for (const sfdxEntity of sfdxEntities) {
            fs_2.writeSync(stream, `${sfdxEntity.id},${shouldSkipCodeCoverage}\r\n`);
        }
        const command = `sfdx force:data:bulk:upsert --json -s ApexTestQueueItem -i Id -f "${tempFileName}" -u ${usernameOrAlias}`;
        const results = await sfdx_core_1.SfdxCore.command(command);
        return SfdxTasks.getJobInfo(results);
    }
    static async getBulkJobStatusAsync(usernameOrAlias, jobInfo) {
        if (!usernameOrAlias || !jobInfo || !jobInfo.id) {
            return null;
        }
        let command = `sfdx force:data:bulk:status --json -i ${jobInfo.id} -u ${usernameOrAlias}`;
        if (jobInfo.batchId) {
            command += ` -b ${jobInfo.batchId}`;
        }
        const results = await sfdx_core_1.SfdxCore.command(command);
        const newJobInfo = SfdxTasks.getJobInfo(results);
        newJobInfo.statusCount++;
        return newJobInfo;
    }
    static waitForJobAsync(usernameOrAlias, jobInfo, maxWaitSeconds = -1, sleepMiliseconds = 5000) {
        return tslib_1.__asyncGenerator(this, arguments, function* waitForJobAsync_1() {
            const maxCounter = (maxWaitSeconds * 1000) / sleepMiliseconds;
            jobInfo.statusCount = 0;
            while ((maxCounter < 0 || jobInfo.statusCount <= maxCounter) && !jobInfo.isDone()) {
                yield tslib_1.__await(utils_1.default.sleep(sleepMiliseconds));
                jobInfo = yield tslib_1.__await(SfdxTasks.getBulkJobStatusAsync(usernameOrAlias, jobInfo));
                jobInfo.maxStatusCount = maxCounter;
                jobInfo.statusCount++;
                yield yield tslib_1.__await(jobInfo);
            }
            return yield tslib_1.__await(jobInfo);
        });
    }
    static async getOrgInfo(orgAliasOrUsername) {
        if (!orgAliasOrUsername) {
            return null;
        }
        const result = sfdx_core_1.SfdxCore.command(`sfdx force:org:display --json -u ${orgAliasOrUsername}`);
        return new SfdxOrgInfo(result);
    }
    static async deleteRecordById(orgAliasOrUsername, metaDataType, recordId, isToolingApi = false) {
        if (!orgAliasOrUsername || !metaDataType || !recordId) {
            return null;
        }
        let command = `sfdx force:data:record:delete --json -u ${orgAliasOrUsername} -s ${metaDataType} -i ${recordId}`;
        if (isToolingApi) {
            command += ' -t';
        }
        const result = await sfdx_core_1.SfdxCore.command(command);
        return new SfdxResult(result);
    }
    static async getFolderSOQLDataAsync(usernameOrAlias) {
        if (!this._folderPaths) {
            const allFolders = await sfdx_query_1.SfdxQuery.getFoldersAsync(usernameOrAlias);
            this._folderPaths = new Map();
            for (const folder of allFolders) {
                if (!folder) {
                    continue;
                }
                const pathParts = this.getFolderFullPath(allFolders, folder, []);
                this._folderPaths.set(folder.id, pathParts.join('/'));
            }
        }
        return this._folderPaths;
    }
    // Recursively looks up a Folder's parent until it reaches the tree's root.
    // This is only needed for Folder structures which are more than one level deep.
    // SFDX only returns a entitie's direct parent.
    static getFolderFullPath(folders, currentFolder, pathParts) {
        if (currentFolder.developerName) {
            pathParts.unshift(currentFolder.developerName.trim());
        }
        for (const folder of folders) {
            if (folder.id === currentFolder.parentId) {
                pathParts = this.getFolderFullPath(folders, folder, pathParts);
            }
        }
        return pathParts;
    }
    static getJobInfo(results) {
        const jobInfo = new SfdxJobInfo();
        if (results && results[0]) {
            // If there is a jobId then we have a batch job
            // If not its is a single job
            if (results[0].jobId) {
                jobInfo.id = results[0].jobId;
                jobInfo.batchId = results[0].id;
            }
            else {
                jobInfo.id = results[0].id;
            }
            jobInfo.state = results[0].state;
            jobInfo.createdDate = results[0].createdDate;
        }
        return jobInfo;
    }
}
exports.SfdxTasks = SfdxTasks;
SfdxTasks._folderPaths = null;
//# sourceMappingURL=sfdx-tasks.js.map