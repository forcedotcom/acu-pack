import { OptionsBase } from './options';
export default class SchemaOptions extends OptionsBase {
    excludeCustomObjectNames: string[];
    includeCustomObjectNames: string[];
    outputDefMap: Map<string, string[]>;
    excludeFieldIfTrueFilter: string;
    getDynamicCode(sheetName?: string): string;
    getEntityDefinitionFields(sheetName?: string): string[];
    deserialize(serializedOptions: string): Promise<void>;
    serialize(): Promise<string>;
    protected loadDefaults(): Promise<void>;
}
