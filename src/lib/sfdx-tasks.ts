import { ensureArray } from '@salesforce/ts-types';
import { SfdxCore } from './sfdx-core';
import { SfdxFolder } from './sfdx-query';
import path = require('path');
import { PackageOptions } from '../lib/package-options';
import Utils from '../lib/utils';
import { promises as fs } from 'fs';
import { SfdxQuery } from './sfdx-query';
import { XPathOptions } from '../lib/xpath-options';

export class SfdxTasks {

    public static async describeMetadata(usernameOrAlias: string): Promise<any[]> {
        const response = await SfdxCore.command(`sfdx force:mdapi:describemetadata --json -u ${usernameOrAlias}`);
        return !response || !response.metadataObjects
            ? []
            : ensureArray(response.metadataObjects);
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

    public static async listMetadatas(usernameOrAlias: string, metadataTypes: Set<string>, namespaces: Set<string> = null): Promise<Map<string, string[]>> {
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

    public static async getPackageOptionsAsync(optionsPath: string): Promise<PackageOptions> {
        let options: PackageOptions;
        if (optionsPath) {
            if (await Utils.pathExistsAsync(optionsPath)) {
                options = await SfdxCore.fileToJson<PackageOptions>(optionsPath);
            } else {
                options = new PackageOptions();
                // load the default values
                options.loadDefaults();
                const dir = path.dirname(optionsPath);
                if (dir) {
                    await fs.mkdir(dir, { recursive: true });
                }
                await SfdxCore.jsonToFile(options, optionsPath);
            }
        }
        return options;
    }

    public static async describeObject(usernameOrAlias: string, objectName: string): Promise<any> {
        return await SfdxCore.command(`sfdx force:schema:sobject:describe --json -s ${objectName} -u ${usernameOrAlias}`);
    }

    public static async getXPathOptionsAsync(optionsPath: string): Promise<XPathOptions> {
        let options: XPathOptions;
        if (optionsPath) {
            if (await Utils.pathExistsAsync(optionsPath)) {
                const data = (await fs.readFile(optionsPath)).toString();
                options = XPathOptions.deserialize(data);
            } else {
                options = new XPathOptions();
                // load the default values
                options.loadDefaults();
                const dir = path.dirname(optionsPath);
                if (dir) {
                    await fs.mkdir(dir, { recursive: true });
                }
                await fs.writeFile(optionsPath, options.serialize());
            }
        }
        return options;
    }

    protected static _folderPaths: Map<string, string> = null;

    private static async getFolderSOQLData(usernameOrAlias: string) {
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

}
