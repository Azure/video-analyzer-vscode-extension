import Localizer from "../localization";
import { InitializationParameters } from "../types/vscodeDelegationTypes";

// VS Code exposes this function: https://code.visualstudio.com/api/references/vscode-api#WebviewPanelSerializer
declare const acquireVsCodeApi: any;

export async function initalizeEnvironment(language: string) {
  await Localizer.loadUserLanguage(language);

  return new Promise(
    (resolve: (params: InitializationParameters) => void, reject) => {
      // Check if this is running in VS Code (might be developing in React)
      if (typeof acquireVsCodeApi === "function") {
        (function () {
          const vscode = acquireVsCodeApi();
          const oldState = vscode.getState() || {};

          // Handle messages sent from the extension to the webview
          window.addEventListener("message", (event) => {
            const message = event.data;
            // use message.command
          });

          resolve({
            state: oldState,
            vsCodeSetState: vscode.setState,
          });
        })();
      } else {
        // We won't save/restore state in browser, use noop function
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        resolve({ state: {}, vsCodeSetState: () => {} });
      }
    }
  );
}
