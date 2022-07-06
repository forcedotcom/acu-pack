import { OptionsBase, OptionsSettings } from './options';
export declare class OptionsFactory {
    static get<T extends OptionsBase>(type: new () => T, optionsFilePath?: string, settings?: OptionsSettings): Promise<T>;
    static set(options: OptionsBase, optionsFilePath: string): Promise<void>;
}
