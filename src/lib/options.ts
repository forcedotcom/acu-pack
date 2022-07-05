import path = require('path');
import Utils from './utils';
import { promises as fs } from 'fs';
import { SfdxCore } from './sfdx-core';

export abstract class OptionsBase {
    public version: number = 1.0;
    // Make sure we have a default ctor
    constructor() {

    }

    public get isCurrentVersion(): boolean {
        return true;
    }

    public async load(optionsPath: string): Promise<void> {
        const json = await this.readFile(optionsPath);
        if (!json) {
            await this.loadDefaults();
            if (optionsPath) {
                await this.save(optionsPath);
            }
        } else {
            await this.deserialize(json);
        }
    }

    public async save(optionsPath: string): Promise<void> {
        if (!optionsPath) {
            throw new Error('The optionsPath argument cannot be null.');
        }
        const dir = path.dirname(optionsPath);
        if (dir) {
            await Utils.mkDirPath(dir);
        }
        await fs.writeFile(optionsPath, (await this.serialize()));
    }

    protected deserialize(serializedOptionBase: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const options = JSON.parse(serializedOptionBase);
                for (const field of Object.keys(options)) {
                    if (this.hasOwnProperty(field)) {
                        this[field] = options[field];
                    }
                }
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    protected serialize(): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                resolve(JSON.stringify(this, null, SfdxCore.jsonSpaces));
            } catch (err) {
                reject(err);
            }
        });
    }

    protected abstract loadDefaults(): Promise<void>;

    protected async readFile(optionsPath: string): Promise<string> {
        if (!optionsPath) {
            return null;
        }
        if (await Utils.pathExists(optionsPath)) {
            return (await fs.readFile(optionsPath)).toString();
        } else {
            return null;
        }
    }
}
