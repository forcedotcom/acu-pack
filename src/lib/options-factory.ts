import { OptionsBase, OptionsSettings } from './options';

export class OptionsFactory {

    public static async get<T extends OptionsBase>(type: new() => T, optionsFilePath?: string, settings?: OptionsSettings): Promise<T> {
        if (!type) {
            return null;
        }
        if (!(type.prototype instanceof OptionsBase)) {
            throw new Error('Specified type does not extend OptionsBase.');
        }
        const options = new type();
        if (settings) {
            options.settings = settings;
        }
        await options.load(optionsFilePath);

        return options;
    }

    public static async set(options: OptionsBase, optionsFilePath: string): Promise<void> {
        if (!optionsFilePath) {
            throw new Error('You must specify an optionsFilePath.');
        }
        await options.save(optionsFilePath);
    }
}
