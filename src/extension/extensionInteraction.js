export function initThenRun(callback) {
  // Check if this is running in VS Code (might be developing in React)
  if (typeof acquireVsCodeApi === "function") {
    (function () {
      // eslint-disable-next-line no-undef
      const vscode = acquireVsCodeApi();
      const oldState = vscode.getState() || {};

      // Handle messages sent from the extension to the webview
      window.addEventListener("message", (event) => {
        const message = event.data;
        // use message.command
      });

      callback(oldState, vscode.setState);
    })();
  } else {
    // We won't save/restore state in browser, use noop function
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    callback({}, () => {});
  }
}
