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

    static camelToSentenceCase(text: string): string {
        text = text.replace("MediaGraph", "");
        text = text.replace(/([A-Z])/g, " $1").trim();
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
}
