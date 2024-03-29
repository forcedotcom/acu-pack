import { OptionsBase } from './options';
export default class SchemaOptions extends OptionsBase {
    private static CURRENT_VERSION;
    excludeCustomObjectNames: string[];
    includeCustomObjectNames: string[];
    outputDefMap: Map<string, string[]>;
    excludeFieldIfTrueFilter: string;
    getDynamicCode(sheetName?: string): string;
    getEntityDefinitionFields(sheetName?: string): string[];
    deserialize(serializedOptions: string): Promise<void>;
    serialize(): Promise<string>;
    protected loadDefaults(): Promise<void>;
    protected get currentVersion(): number;
}
