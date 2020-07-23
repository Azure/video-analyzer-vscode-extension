import * as path from "path";

export default class Localizer {
  private static locStrings: Record<string, string>;

  public static loadLocalization(locale: string, extensionPath: string) {
    let localizationFile = "package.nls.json";

    if (locale != "en") {
      localizationFile = `package.nls.${locale}.json`;
    }

    try {
      Localizer.locStrings = require(path.join(
        extensionPath,
        localizationFile
      ));
    } catch {
      // locale is not available, default to English
      Localizer.loadLocalization("en", extensionPath);
    }
  }

  public static localize(key: string) {
    return this.locStrings[key];
  }
}
