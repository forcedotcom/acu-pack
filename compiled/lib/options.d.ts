export declare class OptionsSettings {
    ignoreVersion: boolean;
    blockExternalConnections: boolean;
}
export declare abstract class OptionsBase {
    version: number;
    get settings(): OptionsSettings;
    set settings(optionSettings: OptionsSettings);
    private prvSettings;
    constructor();
    get isCurrentVersion(): boolean;
    load(optionsPath: string): Promise<void>;
    save(optionsPath: string): Promise<void>;
    protected ignoreField(fieldName: string): boolean;
    protected deserialize(serializedOptionBase: string): Promise<void>;
    protected serialize(): Promise<string>;
    protected readFile(optionsPath: string): Promise<string>;
    protected get currentVersion(): number;
    protected setCurrentVersion(): void;
    protected abstract loadDefaults(): Promise<void>;
}
