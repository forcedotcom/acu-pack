"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SfdxTasks = exports.SfdxOrgInfo = exports.SfdxJobInfo = void 0;
const tslib_1 = require("tslib");
const path = require("path");
const fs_1 = require("fs");
const ts_types_1 = require("@salesforce/ts-types");
const utils_1 = require("../lib/utils");
const utils_2 = require("../lib/utils");
const constants_1 = require("../lib/constants");
const sfdx_core_1 = require("./sfdx-core");
const sfdx_query_1 = require("./sfdx-query");
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
    constructor(result = null) {
        if (!result) {
            return;
        }
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
class SfdxTasks {
    static async describeMetadata(usernameOrAlias) {
        const response = await sfdx_core_1.SfdxCore.command(`${constants_1.default.SFDX_DESCRIBE_METADATA} --json -u ${usernameOrAlias}`);
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
        return !response || !response.metadataObjects
            ? []
            : (0, ts_types_1.ensureArray)(response.metadataObjects);
    }
    static async executeAnonymousBlock(usernameOrAlias, apexFilePath, logLevel = 'debug') {
        const response = await sfdx_core_1.SfdxCore.command(`${constants_1.default.SFDX_APEX_EXECUTE} --json --loglevel ${logLevel} -u ${usernameOrAlias} --apexcodefile ${apexFilePath}`);
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
        return response.result;
    }
    static async retrievePackage(usernameOrAlias, packageFilePath = constants_1.default.DEFAULT_PACKAGE_PATH) {
        // get custom objects
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
        return await sfdx_core_1.SfdxCore.command(`${constants_1.default.SFDX_SOURCE_RETRIEVE} --json -x ${packageFilePath} -u ${usernameOrAlias}`);
    }
    static async initializeProject(projectName) {
        return await sfdx_core_1.SfdxCore.command(`${constants_1.default.SFDX_PROJECT_CREATE} --projectname ${projectName}`);
    }
    static getTypesForPackage(usernameOrAlias, describeMetadatas, namespaces = null) {
        return tslib_1.__asyncGenerator(this, arguments, function* getTypesForPackage_1() {
            var e_1, _a, e_2, _b, e_3, _c;
            let folderPathMap;
            for (const describeMetadata of describeMetadatas) {
                const members = [];
                if (!describeMetadata.inFolder) {
                    try {
                        for (var _d = (e_1 = void 0, tslib_1.__asyncValues(this.listMetadata(usernameOrAlias, describeMetadata.xmlName, namespaces))), _e; _e = yield tslib_1.__await(_d.next()), !_e.done;) {
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
                        folderPathMap = yield tslib_1.__await(this.getFolderSOQLData(usernameOrAlias));
                    }
                    try {
                        // Iterate all the folder metas
                        for (var _f = (e_2 = void 0, tslib_1.__asyncValues(this.listMetadata(usernameOrAlias, folderMetaName, namespaces))), _g; _g = yield tslib_1.__await(_f.next()), !_g.done;) {
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
                                for (var _h = (e_3 = void 0, tslib_1.__asyncValues(this.listMetadataInFolder(usernameOrAlias, describeMetadata.xmlName, folderMeta.fullName))), _j; _j = yield tslib_1.__await(_h.next()), !_j.done;) {
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
            const results = await sfdx_core_1.SfdxCore.command(`${constants_1.default.SFDX_MDAPI_LISTMETADATA} --json -m ${metadataType} -u ${usernameOrAlias}`);
            // If there are no instances of the metadatatype SFDX just returns {status:0}
            const members = [];
            if (results) {
                for (const result of results) {
                    // If we have a metadata namespace AND
                    //  We are excluding namespaces OR
                    //  The list of allowed namespaces does not include the metdata namespace
                    // Continue.
                    if (result.namespacePrefix && namespaces && !namespaces.has(result.namespacePrefix)) {
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
            const results = yield tslib_1.__await(sfdx_core_1.SfdxCore.command(`${constants_1.default.SFDX_MDAPI_LISTMETADATA} --json -m ${metadataType} -u ${usernameOrAlias}`));
            // If there are no instances of the metadatatype SFDX just returns {status:0}
            if (results) {
                let resultsArray;
                try {
                    resultsArray = (0, ts_types_1.ensureArray)(results);
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
            const results = yield tslib_1.__await(sfdx_core_1.SfdxCore.command(`${constants_1.default.SFDX_MDAPI_LISTMETADATA} --json -m ${metadataType} --folder ${folderName} -u ${usernameOrAlias}`));
            // If there are no instances of the metadatatype SFDX just returns {status:0}
            if (results) {
                let resultsArray;
                try {
                    resultsArray = (0, ts_types_1.ensureArray)(results);
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
    static async describeObject(usernameOrAlias, objectName) {
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
        return await sfdx_core_1.SfdxCore.command(`${constants_1.default.SFDX_SCHEMA_DESCRIBE} --json -s ${objectName} -u ${usernameOrAlias}`);
    }
    static async enqueueApexTests(usernameOrAlias, sfdxEntities, shouldSkipCodeCoverage = false) {
        if (!usernameOrAlias || !sfdxEntities) {
            return null;
        }
        const tempFileName = 'apexTestQueueItems.csv';
        // Create the file for the bulk upsert
        // Create for writing - truncates if exists
        const stream = (0, fs_1.openSync)(tempFileName, 'w');
        // NOTE: Do NOT include spaces between fields...results in an error
        (0, fs_1.writeSync)(stream, 'ApexClassId,ShouldSkipCodeCoverage\r\n');
        for (const sfdxEntity of sfdxEntities) {
            (0, fs_1.writeSync)(stream, `${sfdxEntity.id},${shouldSkipCodeCoverage}\r\n`);
        }
        const command = `${constants_1.default.SFDX_DATA_UPSERT} --json -s ApexTestQueueItem -i Id -f "${tempFileName}" -u ${usernameOrAlias}`;
        const results = await sfdx_core_1.SfdxCore.command(command);
        return SfdxTasks.getJobInfo(results);
    }
    static async getBulkJobStatus(usernameOrAlias, jobInfo) {
        if (!usernameOrAlias || !jobInfo || !jobInfo.id) {
            return null;
        }
        let command = `${constants_1.default.SFDX_DATA_STATUS} --json -i ${jobInfo.id} -u ${usernameOrAlias}`;
        if (jobInfo.batchId) {
            command += ` -b ${jobInfo.batchId}`;
        }
        const results = await sfdx_core_1.SfdxCore.command(command);
        const newJobInfo = SfdxTasks.getJobInfo(results);
        newJobInfo.statusCount++;
        return newJobInfo;
    }
    static waitForJob(usernameOrAlias, jobInfo, maxWaitSeconds = -1, sleepMiliseconds = 5000) {
        return tslib_1.__asyncGenerator(this, arguments, function* waitForJob_1() {
            const maxCounter = (maxWaitSeconds * 1000) / sleepMiliseconds;
            jobInfo.statusCount = 0;
            while ((maxCounter <= 0 || jobInfo.statusCount <= maxCounter) && !jobInfo.isDone()) {
                yield tslib_1.__await(utils_1.default.sleep(sleepMiliseconds));
                jobInfo = yield tslib_1.__await(SfdxTasks.getBulkJobStatus(usernameOrAlias, jobInfo));
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
        const result = await sfdx_core_1.SfdxCore.command(`${constants_1.default.SFDX_ORG_DISPLAY} --json -u ${orgAliasOrUsername}`);
        return new SfdxOrgInfo(result);
    }
    static getMapFromSourceTrackingStatus(sourceTrackingStatues) {
        if (!sourceTrackingStatues) {
            return null;
        }
        const metadataMap = new Map();
        const conflictTypes = new Map();
        const deleteTypes = new Map();
        for (const status of sourceTrackingStatues) {
            /*
              Actions: Add, Changed, Deleted
              {
                "state": "Local Add",
                "fullName": "SF86_Template",
                "type": "StaticResource",
                "filePath": "force-app\\main\\default\\staticresources\\SF86_Template.xml"
              },
              {
                "state": "Remote Add",
                "fullName": "Admin",
                "type": "Profile",
                "filePath": null
              },
               {
                "state": "Remote Changed (Conflict)",
                "fullName": "Custom%3A Support Profile",
                "type": "Profile",
                "filePath": "force-app\\main\\default\\profiles\\Custom%3A Support Profile.profile-meta.xml"
              },
            */
            const actionParts = status.state.split(' ');
            const typeName = status.type.trim().endsWith('Folder')
                ? status.type.replace(/Folder/, '').trim()
                : status.type.trim();
            const fullName = status.fullName.trim();
            let collection = null;
            if (status.state.includes('(Conflict)')) {
                collection = conflictTypes;
            }
            else if (actionParts[0] === 'Remote') {
                switch (actionParts[1]) {
                    case 'Add':
                    case 'Changed':
                        collection = metadataMap;
                        break;
                    case 'Deleted':
                        collection = deleteTypes;
                        break;
                    default:
                        throw new Error(`Unknown Action: ${actionParts[1]}`);
                }
            }
            if (collection != null) {
                if (!collection.has(typeName)) {
                    collection.set(typeName, [fullName]);
                }
                else {
                    collection.get(typeName).push(fullName);
                }
            }
        }
        return {
            map: metadataMap,
            conflicts: conflictTypes,
            deletes: deleteTypes
        };
    }
    static async getSourceTrackingStatus(orgAliasOrUsername) {
        if (!orgAliasOrUsername) {
            return null;
        }
        const results = await sfdx_core_1.SfdxCore.command(`${constants_1.default.SFDX_SOURCE_STATUS} --json -u ${orgAliasOrUsername}`);
        // If there are no instances of the metadatatype SFDX just returns {status:0}
        if (!results) {
            return null;
        }
        let resultsArray;
        try {
            resultsArray = (0, ts_types_1.ensureArray)(results);
        }
        catch (_a) {
            resultsArray = [results];
        }
        const statuses = [];
        for (const result of resultsArray) {
            statuses.push({
                state: result.state,
                fullName: result.fullName,
                type: result.type,
                filePath: result.filePath
            });
            /*
              Actions: Add, Changed, Deleted
              {
                "state": "Local Add",
                "fullName": "SF86_Template",
                "type": "StaticResource",
                "filePath": "force-app\\main\\default\\staticresources\\SF86_Template.xml"
              },
              {
                "state": "Remote Add",
                "fullName": "Admin",
                "type": "Profile",
                "filePath": null
              },
               {
                "state": "Remote Changed (Conflict)",
                "fullName": "Custom%3A Support Profile",
                "type": "Profile",
                "filePath": "force-app\\main\\default\\profiles\\Custom%3A Support Profile.profile-meta.xml"
              },
            */
        }
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
        return statuses;
    }
    static async getDefaultOrgAlias() {
        const result = await sfdx_core_1.SfdxCore.command(`${constants_1.default.SFDX_GET_DEFAULT_USERNAME} --json`);
        return (result[0] != null
            ? result[0].value
            : null);
    }
    static async getUnsupportedMetadataTypes() {
        const result = await utils_1.default.getRestResult(utils_2.RestAction.GET, constants_1.default.METADATA_COVERAGE_REPORT_URL);
        const myMap = new Map(Object.entries(result.getContent().types));
        const types = [];
        for (const [key, value] of myMap) {
            if (value.channels && !value.channels.metadataApi) {
                types.push(key);
            }
        }
        return utils_1.default.sortArray(types);
    }
    static async getFolderSOQLData(usernameOrAlias) {
        if (!this.proFolderPaths) {
            const allFolders = await sfdx_query_1.SfdxQuery.getFolders(usernameOrAlias);
            this.proFolderPaths = new Map();
            for (const folder of allFolders) {
                if (!folder) {
                    continue;
                }
                const pathParts = this.getFolderFullPath(allFolders, folder, []);
                this.proFolderPaths.set(folder.id, pathParts.join('/'));
            }
        }
        return this.proFolderPaths;
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
SfdxTasks.defaultMetaTypes = ['ApexClass', 'ApexPage', 'CustomApplication', 'CustomObject', 'CustomTab', 'PermissionSet', 'Profile'];
SfdxTasks.proFolderPaths = null;
//# sourceMappingURL=sfdx-tasks.js.map