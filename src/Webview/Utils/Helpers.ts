import { customWords } from "../../Tools/DefinitionGenerator/customWords";

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
        let sentenceCaseRegex = `(${customWords.join("|")}|[A-Z])`;
        text = text.replace(new RegExp(sentenceCaseRegex, "g"), " $1").trim();
        text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        customWords.forEach((word) => {
            text = text.replace(new RegExp(word, "ig"), word);
        });
        return text;
    }
}
