import {
    BaseSlots,
    createTheme,
    getColorFromString,
    IColor,
    isDark,
    ITheme,
    IThemeSlotRule,
    ThemeGenerator,
    themeRulesStandardCreator
} from "office-ui-fabric-react";

export default class ThemeHelpers {
    static getAdaptedTheme(): ITheme {
        const themeRules = themeRulesStandardCreator();
        const colors = {
            primaryColor: getColorFromString("var(--vscode-button-background)")!,
            textColor: getColorFromString("var(--vscode-foreground)")!,
            backgroundColor: getColorFromString("var(--vscode-editor-background)")!
        };

        function setSlot(rule: IThemeSlotRule, color: string | IColor) {
            ThemeGenerator.setSlot(rule, color, undefined, true, true);
        }

        setSlot(themeRules[BaseSlots[BaseSlots.primaryColor]], colors.primaryColor);
        setSlot(themeRules[BaseSlots[BaseSlots.foregroundColor]], colors.textColor);
        setSlot(themeRules[BaseSlots[BaseSlots.backgroundColor]], colors.backgroundColor);

        // TODO: Test in VS Code (there were some contrast issues with Dracula)
        const isInverted = isDark(themeRules[BaseSlots[BaseSlots.backgroundColor]].color!);

        ThemeGenerator.insureSlots(themeRules, isInverted);

        return createTheme({
            palette: ThemeGenerator.getThemeAsJson(themeRules),
            isInverted
        });
    }

    static attachHtmlStyleAttrListener(callback: () => void): MutationObserver {
        const observer = new MutationObserver(() => {
            callback();
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["style"]
        });
        return observer;
    }
}
