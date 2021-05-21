import merge from "lodash/merge";
import Definitions from "../Definitions/Definitions";
import { NestedLocalizedStrings } from "../Types/GraphTypes";

export default class Localizer {
    private static localized: Record<string, string> = {};
    private static localizedNested: Record<string, NestedLocalizedStrings> = {};

    static async getLanguage(language: string) {
        const versionFolder = Definitions.VersionFolder;
        const interfaceLocStrings = await import(/* webpackMode: "lazy" */ `./${language}.json`);
        const swaggerLocStrings = await import(/* webpackMode: "lazy" */ `../Definitions/${versionFolder}/i18n.${language}.json`); // TODO  load the correct version when needed support for multiple versions
        const swaggerOverrideLocStrings = await import(/* webpackMode: "lazy" */ `../Definitions/${versionFolder}/generatedStringOverrides.json`); // TODO  localize and get correct file

        return [interfaceLocStrings, merge(swaggerLocStrings, swaggerOverrideLocStrings)];
    }

    static async loadUserLanguage(forceLang?: string) {
        let language = forceLang || "en";
        // navigator might not be set, for example when running tests
        if (!forceLang && typeof navigator !== "undefined") {
            language = navigator.language || navigator.languages[0];
        }

        try {
            [this.localized, this.localizedNested] = await this.getLanguage(language);
        } catch (error) {
            language = "en";
            [this.localized, this.localizedNested] = await this.getLanguage(language);
        }
    }

    static l(key: string) {
        return this.localized[key];
    }

    static getLocalizedStrings(key: string) {
        return this.localizedNested[key] as NestedLocalizedStrings;
    }
}
