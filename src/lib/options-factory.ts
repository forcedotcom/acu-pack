import { OptionsBase } from './options';

export class OptionsFactory {

    public static async get<T extends OptionsBase>(type: new() => T, optionsFilePath?: string): Promise<T> {
        if (!type) {
            return null;
        }
        if (!(type.prototype instanceof OptionsBase)) {
            throw new Error('Specified type does not extend OptionsBase.');
        }
        const options = new type();
        await options.load(optionsFilePath);

        return options;
    }
}
