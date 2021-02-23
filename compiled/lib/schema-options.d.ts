import { OptionsBase } from './options';
export default class SchemaOptions extends OptionsBase {
    excludeCustomObjectNames: string[];
    includeCustomObjectNames: string[];
    outputDefMap: Map<string, string[]>;
    excludeFieldIfTrueFilter: string;
    getDynamicCode(outputDefs: any[]): string;
    getDynamicChildObjectTypeCode(outputDefs: any[]): string;
    deserialize(serializedOptions: string): Promise<void>;
    serialize(): Promise<string>;
    protected loadDefaults(): Promise<void>;
}
