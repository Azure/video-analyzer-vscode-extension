import {
  LocalizedNodeTypeStrings,
  LocalizedNodePropertyStrings,
  LocalizedNodePropertyValueStrings,
} from "../types/graphTypes";

export default class Localizer {
  private static localized: Record<string, string> = {};
  private static localizedNested: Record<
    string,
    | LocalizedNodeTypeStrings
    | LocalizedNodePropertyStrings
    | LocalizedNodePropertyValueStrings
  > = {};

  static async getLanguage(language: string) {
    const interfaceLocStrings = await import(
      /* webpackMode: "lazy" */ `./${language}.json`
    );
    const swaggerLocStrings = await import(
      /* webpackMode: "lazy" */ `../definitions/v1.0/i18n.${language}.json`
    );

    return [interfaceLocStrings, swaggerLocStrings];
  }

  static async loadUserLanguage(forceLang?: string) {
    let language = forceLang || "en";
    // navigator might not be set, for example when running tests
    if (!forceLang && typeof navigator !== "undefined") {
      language = navigator.language || navigator.languages[0];
    }
    language = language.toLowerCase().split("-")[0]; // en-US -> en

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

  static getNodeTypeStrings(key: string) {
    return this.localizedNested[key] as LocalizedNodeTypeStrings;
  }

  static getNodePropertyStrings(key: string) {
    return this.localizedNested[key] as LocalizedNodePropertyStrings;
  }

  static getNodePropertyValueStrings(key: string) {
    return this.localizedNested[key] as LocalizedNodePropertyValueStrings;
  }
}
