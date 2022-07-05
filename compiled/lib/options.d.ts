export declare abstract class OptionsBase {
    version: number;
    constructor();
    get isCurrentVersion(): boolean;
    load(optionsPath: string): Promise<void>;
    save(optionsPath: string): Promise<void>;
    protected deserialize(serializedOptionBase: string): Promise<void>;
    protected serialize(): Promise<string>;
    protected abstract loadDefaults(): Promise<void>;
    protected readFile(optionsPath: string): Promise<string>;
}
