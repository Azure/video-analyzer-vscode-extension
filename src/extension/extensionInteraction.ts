import Localizer from "../localization/Localizer";
import { InitializationParameters } from "../types/vscodeDelegationTypes";
import { PageType } from "../utils/Constants";

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
                (function () {
                    const oldState = vscode.getState() || {};

                    // Handle messages sent from the extension to the webview
                    window.addEventListener("message", (event) => {
                        const message = event.data;
                        // use message.command
                    });

                    resolve({
                        state: oldState,
                        vsCodeSetState: vscode.setState
                    });
                })();
            } else {
                // We won't save/restore state in browser, use noop function
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                resolve({ state: { pageViewType: PageType.graphPage }, vsCodeSetState: () => {} });
            }
        });
    }
}
