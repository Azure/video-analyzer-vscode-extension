import * as path from "path";

const locStrings = require("../../../package.nls.json");

export default class Localizer {
    private static locStrings: Record<string, string>;

    public static loadLocalization(locale: string, extensionPath: string) {
        let localizationFile = "package.nls.json";

        if (locale != "en") {
            localizationFile = `package.nls.${locale}.json`;
        }

        Localizer.locStrings = locStrings;
        // Disabling localization as this was not setup using nls. will work on localization post preview release.
        // try {
        //     Localizer.locStrings = require(path.join(extensionPath, localizationFile));
        // } catch (ex) {
        //     console.log(ex);
        //     // locale is not available, default to English
        //     Localizer.loadLocalization("en", extensionPath);
        // }
    }

    public static localize(key: string) {
        return Localizer.locStrings[key];
    }
}
