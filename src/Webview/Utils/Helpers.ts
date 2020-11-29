import { customWords } from "../../Tools/DefinitionGenerator/customWords";
import customDefinitions from "../Definitions/v2.0.0/customPropertyTypes.json";
import validationJson from "../Definitions/v2.0.0/validation.json";
import Localizer from "../Localization/Localizer";

interface Duration {
    years: number;
    months: number;
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}
export default class Helpers {
    // checks if an object is {}
    static isEmptyObject(object: any) {
        if (!object) {
            return true;
        }
        return Object.keys(object).length === 0;
    }

    static convertToCamel(name: string): string {
        name = name.replace("MediaGraph", "");
        name = name.charAt(0).toLowerCase() + name.slice(1);
        return name;
    }

    static camelToSentenceCase(text: string, removeMediaGraph: boolean): string {
        if (removeMediaGraph) {
            text = text.replace("MediaGraph", "");
        }
        const sentenceCaseRegex = `(${customWords.join("|")}|[A-Z])`;
        text = text.replace(new RegExp(sentenceCaseRegex, "g"), " $1").trim();
        text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        customWords.forEach((word) => {
            text = text.replace(new RegExp(word, "ig"), word);
        });
        return text;
    }

    static secondsToIso = (value: any) => {
        return "PT0H0M{0}S".format(value);
    };

    static isoToSeconds(isoString: any) {
        const duration = Helpers.parseXmlDuration(isoString);
        return duration.days * 24 * 60 * 60 + duration.hours * 60 * 60 + duration.minutes * 60 + duration.seconds;
    }

    static parseXmlDuration(duration: any): Duration {
        const regex = /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/;
        const matches: any[] = duration.match(regex);
        return {
            years: matches[3] ? parseFloat(matches[3]) : 0,
            months: matches[5] ? parseFloat(matches[5]) : 0,
            weeks: matches[7] ? parseFloat(matches[7]) : 0,
            days: matches[9] ? parseFloat(matches[9]) : 0,
            hours: matches[12] ? parseFloat(matches[12]) : 0,
            minutes: matches[14] ? parseFloat(matches[14]) : 0,
            seconds: matches[16] ? parseFloat(matches[16]) : 0
        };
    }

    static validateRequiredProperty(value: string, propertyType: string) {
        switch (propertyType) {
            case "boolean":
                if (value === "") {
                    return Localizer.l("propertyEditorValidationUndefined");
                }
                break;
            case "string":
                if (!value) {
                    return Localizer.l("propertyEditorValidationUndefinedOrEmpty");
                }
                break;
            default:
                if (value) {
                    try {
                        JSON.parse(value);
                    } catch (e) {
                        return Localizer.l("propertyEditorValidationInvalidJSON");
                    }
                } else {
                    return Localizer.l("propertyEditorValidationEmpty");
                }
                break;
        }
        return "";
    }

    static validateProperty(value: string, key: any) {
        if (value === "" || value == undefined) {
            return "";
        }
        const format = (customDefinitions as any)[key];
        if (format === "urlFormat") {
            const r = new RegExp('^(ftp|http|https)://[^ "]+$');
            if (!r.test(value)) {
                return Localizer.l("notValidUrl");
            }
        } else if (format === "number" || format === "isoDuration") {
            const isNum = /^-?\d+$/.test(value);
            if (!isNum) {
                return Localizer.l("valueMustBeNumbersError");
            }
        }
        const validationValue = (validationJson as any)[key];
        if (validationValue) {
            const validationType = validationValue.type;
            const propertyValue = validationValue.value;
            switch (validationType) {
                case "regex": {
                    const r = new RegExp(propertyValue);
                    if (!r.test(value)) {
                        return Localizer.l("regexPatternError").format(propertyValue);
                    }
                    return "";
                }
                case "maxLength": {
                    if (value.length > propertyValue) {
                        return Localizer.l("maxLengthError").format(propertyValue);
                    }
                    return "";
                }
                case "minLength": {
                    return "";
                }
                case "minMaxLength": {
                    if (value.length < propertyValue[0] || value.length > propertyValue[1]) {
                        return Localizer.l("minMaxLengthError").format(propertyValue[0], propertyValue[1]);
                    }
                    return "";
                }
                case "minValue": {
                    if (value < propertyValue) {
                        return Localizer.l("minValueError").format(propertyValue);
                    }
                    return "";
                }
                case "minMaxValue": {
                    if (value < propertyValue[0] || value > propertyValue[1]) {
                        return Localizer.l("minMaxError").format(propertyValue[0], propertyValue[1], propertyValue[2]);
                    }
                    return "";
                }
            }
        }

        return "";
    }
}
