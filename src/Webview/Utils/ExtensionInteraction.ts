import Localizer from "../Localization/Localizer";
import { InitializationParameters } from "../Types/VSCodeDelegationTypes";
import { PageType } from "./Constants";
import PostMessage from "./PostMessage";

export class ExtensionInteraction {
    private static _vsCode: vscode;

    public static getVSCode() {
        if (typeof this._vsCode == "undefined" && typeof acquireVsCodeApi == "function") {
            this._vsCode = acquireVsCodeApi();
        }
        return this._vsCode;
    }

    public static async initializeEnvironment(language: string) {
        await Localizer.loadUserLanguage(language);

        return new Promise((resolve: (params: InitializationParameters) => void, reject) => {
            // Check if this is running in VS Code (might be developing in React)
            const vscode = this.getVSCode();
            if (vscode) {
                const oldState = vscode.getState() || {};

                PostMessage.RegisterPostMessageParent(vscode);

                resolve({
                    state: oldState,
                    vsCodeSetState: vscode.setState
                });
            } else {
                // We won't save/restore state in browser, use noop function
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                resolve({ state: { pageViewType: PageType.graphPage, editMode: false }, vsCodeSetState: () => {} });
            }
        });
    }
}
