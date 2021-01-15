import { OptionsBase } from './options';
export default class SchemaOptions extends OptionsBase {
    excludeCustomObjectNames: string[];
    includeCustomObjectNames: string[];
    outputDefs: any[];
    excludeFieldIfTrueFilter: string;
    getDynamicCode(): string;
    protected loadDefaults(): Promise<void>;
}
