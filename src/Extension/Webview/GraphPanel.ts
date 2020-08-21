import { filter } from "lodash";
import * as path from "path";
import * as vscode from "vscode";
import Localizer from "../Util/Localizer";

interface PostMessageIn {
    name: string;
    callback?: (data?: any) => void;
}

interface PostMessageOut {
    name: string;
    data: { pageType: string; graphData?: any; graphInstance?: any };
}

/**
 * Manages graph editor webview panels
 */
export class GraphEditorPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: GraphEditorPanel | undefined;

    public static readonly viewType = "lvaTopologyEditor";

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionPath: string;
    private _disposables: vscode.Disposable[] = [];
    private _registeredMessages: PostMessageIn[] = [];

    public static createOrShow(extensionPath: string, pageTitle: string) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        // If we already have a panel, show it.
        if (GraphEditorPanel.currentPanel) {
            GraphEditorPanel.currentPanel._panel.reveal(column);
            GraphEditorPanel.currentPanel.dispose();
            //return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(GraphEditorPanel.viewType, pageTitle, column || vscode.ViewColumn.One, {
            // Enable javascript in the webview
            enableScripts: true,

            // And restrict the webview to only loading content from our extension's `build` directory.
            localResourceRoots: [vscode.Uri.file(path.join(extensionPath, "build"))]
        });

        GraphEditorPanel.currentPanel = new GraphEditorPanel(panel, extensionPath);
        return GraphEditorPanel.currentPanel;
    }

    public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
        GraphEditorPanel.currentPanel = new GraphEditorPanel(panel, extensionPath);
    }

    private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
        this._panel = panel;
        this._extensionPath = extensionPath;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this._panel.onDidChangeViewState(
            (e) => {
                if (this._panel.visible) {
                    this._update();
                }
            },
            null,
            this._disposables
        );

        this._panel.webview.onDidReceiveMessage(
            (message) => {
                const filteredEvents = this._registeredMessages.filter((event) => {
                    return event.name === message.command;
                });
                if (filteredEvents?.length === 1 && filteredEvents[0].callback) {
                    filteredEvents[0].callback(message.text);
                }
            },
            null,
            this._disposables
        );
    }

    public registerPostMessage(message: PostMessageIn) {
        this._registeredMessages.push(message);
    }

    public postMessage(message: PostMessageOut) {
        this._panel.webview.postMessage({ command: message.name, data: message.data });
    }

    public dispose() {
        GraphEditorPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        this._panel.webview.html = this._getHtmlForWebview();
    }

    private _getResourceInjection(nonce: string, ending: string, template: (uri: vscode.Uri) => string) {
        const webview = this._panel.webview;
        // from the VS Code example, seems to have to be this way instead import
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const manifest = require(path.join(this._extensionPath, "build", "asset-manifest.json"));
        const fileNames = manifest.entrypoints.filter((fileName: string) => fileName.endsWith("." + ending));

        return fileNames
            .map((fileName: string) => {
                // Local path to main script run in the webview
                const scriptPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, "build", fileName));

                // And the uri we use to load this script in the webview
                const uri = webview.asWebviewUri(scriptPathOnDisk);

                return template(uri);
            })
            .join("");
    }

    private _getHtmlForWebview() {
        const webview = this._panel.webview;

        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();

        const stylesheetInjection = this._getResourceInjection(nonce, "css", (uri) => `<link nonce="${nonce}" href="${uri}" rel="stylesheet">`);

        const scriptInjection = this._getResourceInjection(nonce, "js", (uri) => `<script nonce="${nonce}" src="${uri}"></script>`);

        // The linter does not know of this since it is VS Code internal
        // so we set a fallback value
        const language = JSON.parse(process.env.VSCODE_NLS_CONFIG || "{}")["locale"];

        return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">

                    <!--
                    Use a content security policy to only allow loading images from https or from our extension directory,
                    and only allow scripts that have a specific nonce.
                    -->
                    <meta http-equiv="Content-Security-Policy" content="img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${this._panel.title}</title>
                    ${stylesheetInjection}
                </head>
                <body>
                    <div id="root"></div>
                    <script nonce="${nonce}">
                    __webpack_nonce__ = "${nonce}";
                    __webpack_public_path__ = "${webview.asWebviewUri(vscode.Uri.file(path.join(this._extensionPath, "build")))}/";
                    window.language = "${language}";
                    </script>
                    ${scriptInjection}
                </body>
                </html>`;
    }
}

function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
