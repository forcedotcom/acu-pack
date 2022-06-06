import { ensureArray } from '@salesforce/ts-types';
import { SfdxCore } from './sfdx-core';
import { SfdxFolder, SfdxQuery, SfdxEntity } from './sfdx-query';
import path = require('path');
import Utils from '../lib/utils';
import { openSync, writeSync } from 'fs';

export class SfdxJobInfo {
    public id: string;
    public batchId: string;
    public state: string;
    public createdDate: string;
    public statusCount: number;
    public maxStatusCount: number;

    constructor() {
        this.statusCount = 0;
        this.maxStatusCount = 0;
    }

    public isDone(): boolean {
        // Holding1, Queued, Preparing, Processing, Aborted, Completed,Failed
        return this.state === 'Aborted' || this.state === 'Completed' || this.state === 'Failed' || this.state === 'Closed';
    }
}

export class SfdxOrgInfo {
    public username: string;
    public id: string;
    public connectedStatus: string;
    public accessToken: string;
    public instanceUrl: string;
    public clientId: string;
    public alias: string;

    constructor(result: any = null) {
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

export class SfdxTasks {

    public static defaultMetaTypes = ['ApexClass', 'ApexPage', 'CustomApplication', 'CustomObject', 'CustomTab', 'PermissionSet', 'Profile'];

    public static async describeMetadata(usernameOrAlias: string): Promise<any[]> {
        const response = await SfdxCore.command(`sfdx force:mdapi:describemetadata --json -u ${usernameOrAlias}`);
        return !response || !response.metadataObjects
            ? []
            : ensureArray(response.metadataObjects);
    }

    public static async executeAnonymousBlock(usernameOrAlias: string, apexFilePath: string, logLevel: string = 'debug' ): Promise<any> {
        const response = await SfdxCore.command(`sfdx force:apex:execute --json --loglevel ${logLevel} -u ${usernameOrAlias} --apexcodefile ${apexFilePath}`);
        return response.result;
    }

    public static async retrievePackage(usernameOrAlias: string, packageFilePath: string = 'manifest/package.xml'): Promise<any> {
        // get custom objects
        return await SfdxCore.command(`sfdx force:source:retrieve --json -x ${packageFilePath} -u ${usernameOrAlias}`);
    }

    public static async initializeProject(projectName: string): Promise<string> {
        return await SfdxCore.command(`sfdx force:project:create --projectname ${projectName}`);
    }

    public static async* getTypesForPackage(usernameOrAlias: string, describeMetadatas: Set<any>, namespaces: Set<string> = null) {
        let folderPathMap: Map<string, string>;
        for (const describeMetadata of describeMetadatas) {
            const members = [];
            if (!describeMetadata.inFolder) {
                for await (const result of this.listMetadata(usernameOrAlias, describeMetadata.xmlName, namespaces)) {
                    members.push(result.fullName);
                }
            } else {
                const folderMetaName = describeMetadata.xmlName === SfdxCore.EMAIL_TEMPLATE_XML_NAME
                    ? SfdxCore.EMAIL_TEMPLATE_XML_NAME
                    : `${describeMetadata.xmlName}Folder`;

                // Get SOQL folder data (ONCE!)
                if (!folderPathMap) {
                    folderPathMap = await this.getFolderSOQLData(usernameOrAlias);
                }

                // Iterate all the folder metas
                for await (const folderMeta of this.listMetadata(usernameOrAlias, folderMetaName, namespaces)) {
                    // Set the parent Id (used for nested folders)
                    // Salesforce does not return the full path in the metadada
                    //
                    const folderPath = folderPathMap.has(folderMeta.id)
                        ? folderPathMap.get(folderMeta.id)
                        : folderMeta.fullName;

                    // Add the meta for just the folder
                    members.push(folderPath);

                    for await (const inFolderMetadata of this.listMetadataInFolder(usernameOrAlias, describeMetadata.xmlName, folderMeta.fullName)) {
                        // Add the meta for the item in the folder
                        members.push([folderPath, path.basename(inFolderMetadata.fullName)].join('/'));
                    }
                }
            }
            yield { name: describeMetadata.xmlName, members };
        }
    }

    public static async listMetadatas(usernameOrAlias: string, metadataTypes: Iterable<string>, namespaces: Set<string> = null): Promise<Map<string, string[]>> {
        const response = new Map<string, string[]>();
        for (const metadataType of metadataTypes) {
            const results = await SfdxCore.command(`sfdx force:mdapi:listmetadata --json -m ${metadataType} -u ${usernameOrAlias}`);
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
    public static async* listMetadata(usernameOrAlias: string, metadataType: string, namespaces: Set<string> = null) {
        const results = await SfdxCore.command(`sfdx force:mdapi:listmetadata --json -m ${metadataType} -u ${usernameOrAlias}`);
        // If there are no instances of the metadatatype SFDX just returns {status:0}
        if (results) {
            let resultsArray: any[];
            try {
                resultsArray = ensureArray(results);
            } catch {
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
                yield result;
            }
        }
    }

    public static async* listMetadataInFolder(usernameOrAlias: string, metadataType: string, folderName: string, namespaces: Set<string> = null) {
        const results = await SfdxCore.command(`sfdx force:mdapi:listmetadata --json -m ${metadataType} --folder ${folderName} -u ${usernameOrAlias}`);
        // If there are no instances of the metadatatype SFDX just returns {status:0}
        if (results) {
            let resultsArray: any[];
            try {
                resultsArray = ensureArray(results);
            } catch {
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
                yield result;
            }
        }
    }

    public static async describeObject(usernameOrAlias: string, objectName: string): Promise<any> {
        return await SfdxCore.command(`sfdx force:schema:sobject:describe --json -s ${objectName} -u ${usernameOrAlias}`);
    }

    public static async enqueueApexTests(usernameOrAlias: string, sfdxEntities: SfdxEntity[], shouldSkipCodeCoverage: boolean = false): Promise<SfdxJobInfo> {
        if (!usernameOrAlias || !sfdxEntities) {
            return null;
        }

        const tempFileName = 'apexTestQueueItems.csv';

        // Create the file for the bulk upsert
        // Create for writing - truncates if exists
        const stream = openSync(tempFileName, 'w');
        // NOTE: Do NOT include spaces between fields...results in an error
        writeSync(stream, 'ApexClassId,ShouldSkipCodeCoverage\r\n');
        for (const sfdxEntity of sfdxEntities) {
            writeSync(stream, `${sfdxEntity.id},${shouldSkipCodeCoverage}\r\n`);
        }

        const command = `sfdx force:data:bulk:upsert --json -s ApexTestQueueItem -i Id -f "${tempFileName}" -u ${usernameOrAlias}`;
        const results = await SfdxCore.command(command);
        return SfdxTasks.getJobInfo(results);
    }

    public static async getBulkJobStatus(usernameOrAlias: string, jobInfo: SfdxJobInfo): Promise<SfdxJobInfo> {
        if (!usernameOrAlias || !jobInfo || !jobInfo.id) {
            return null;
        }
        let command = `sfdx force:data:bulk:status --json -i ${jobInfo.id} -u ${usernameOrAlias}`;
        if (jobInfo.batchId) {
            command += ` -b ${jobInfo.batchId}`;
        }
        const results = await SfdxCore.command(command);
        const newJobInfo = SfdxTasks.getJobInfo(results);
        newJobInfo.statusCount++;
        return newJobInfo;
    }

    public static async* waitForJob(usernameOrAlias: string, jobInfo: SfdxJobInfo, maxWaitSeconds = -1, sleepMiliseconds = 5000) {
        const maxCounter = (maxWaitSeconds * 1000) / sleepMiliseconds;
        jobInfo.statusCount = 0;
        while ((maxCounter <= 0 || jobInfo.statusCount <= maxCounter) && !jobInfo.isDone()) {
            await Utils.sleep(sleepMiliseconds);

            jobInfo = await SfdxTasks.getBulkJobStatus(usernameOrAlias, jobInfo);
            jobInfo.maxStatusCount = maxCounter;
            jobInfo.statusCount++;

            yield jobInfo;
        }

        return jobInfo;
    }

    public static async getOrgInfo(orgAliasOrUsername: string): Promise<SfdxOrgInfo> {
        if (!orgAliasOrUsername) {
            return null;
        }
        const result = await SfdxCore.command(`sfdx force:org:display --json -u ${orgAliasOrUsername}`);
        return new SfdxOrgInfo(result);
    }

    public static getMapFromSourceTrackingStatus(sourceTrackingStatues: any[]): any {
        if (!sourceTrackingStatues) {
            return null;
        }
        const metadataMap: Map<string, string[]> = new Map<string, string[]>();
        const conflictTypes: Map<string, string[]> = new Map<string, string[]>();
        const deleteTypes: Map<string, string[]> = new Map<string, string[]>();

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
            } else if (actionParts[0] === 'Remote') {
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
                } else {
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

    public static async getSourceTrackingStatus(orgAliasOrUsername: string): Promise<any[]> {
        if (!orgAliasOrUsername) {
            return null;
        }
        const results = await SfdxCore.command(`sfdx force:source:status --json -u ${orgAliasOrUsername}`);
        // If there are no instances of the metadatatype SFDX just returns {status:0}
        if (!results) {
            return null;
        }
        let resultsArray: any[];
        try {
            resultsArray = ensureArray(results);
        } catch {
            resultsArray = [results];
        }
        const statuses: any[] = [];
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
        return statuses;
    }

    public static async getDefaultOrgAlias(): Promise<string> {
        const result = await SfdxCore.command('sfdx config:get defaultusername --json');
        return result[0] != null
            ? result[0].value
            : null;
    }

    protected static _folderPaths: Map<string, string> = null;

    private static async getFolderSOQLData(usernameOrAlias: string): Promise<Map<string, string>> {
        if (!this._folderPaths) {
            const allFolders = await SfdxQuery.getFolders(usernameOrAlias);

            this._folderPaths = new Map<string, string>();
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
    private static getFolderFullPath(folders: SfdxFolder[], currentFolder: SfdxFolder, pathParts: string[]): string[] {
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

    private static getJobInfo(results: any): SfdxJobInfo {
        const jobInfo = new SfdxJobInfo();
        if (results && results[0]) {
            // If there is a jobId then we have a batch job
            // If not its is a single job
            if (results[0].jobId) {
                jobInfo.id = results[0].jobId;
                jobInfo.batchId = results[0].id;
            } else {
                jobInfo.id = results[0].id;
            }
            jobInfo.state = results[0].state;
            jobInfo.createdDate = results[0].createdDate;
        }
        return jobInfo;
    }
}
