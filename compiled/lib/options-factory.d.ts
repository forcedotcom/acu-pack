import { OptionsBase } from './options';
export declare class OptionsFactory {
    static get<T extends OptionsBase>(type: new () => T, optionsFilePath?: string, ignoreVersion?: boolean): Promise<T>;
}
