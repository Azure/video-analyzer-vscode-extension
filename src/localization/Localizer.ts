export default class Localizer {
    private static localized: Record<string, string> = {};

    static async getLanguage(language: string) {
        const interfaceLocStrings = await import(/* webpackMode: "lazy" */ `./${language}.json`);
        const swaggerLocStrings = await import(/* webpackMode: "lazy" */ `../definitions/v1.0/i18n.${language}.json`);

        return {
            ...interfaceLocStrings,
            ...swaggerLocStrings
        };
    }

    static async loadUserLanguage(forceLang?: string) {
        let language = forceLang || "en";
        // navigator might not be set, for example when running tests
        if (!forceLang && typeof navigator !== "undefined") {
            language = navigator.language || navigator.languages[0];
        }
        language = language.toLowerCase().split("-")[0]; // en-US -> en

        try {
            this.localized = await this.getLanguage(language);
        } catch (error) {
            language = "en";
            this.localized = await this.getLanguage(language);
        }
    }

    static l(key: string) {
        return this.localized[key];
    }
}
