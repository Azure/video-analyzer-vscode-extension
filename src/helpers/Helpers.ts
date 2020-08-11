export default class Helpers {
    // checks if an object is {}
    static isEmptyObject(object: any) {
        return Object.keys(object).length === 0;
    }

    // lowercase first letter
    static lowercaseFirstCharacter(name: string): string {
        name = name.replace("MediaGraph", "");
        name = name.charAt(0).toLowerCase() + name.slice(1);
        return name;
    }
}
