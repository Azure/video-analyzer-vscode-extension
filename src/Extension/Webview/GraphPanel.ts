import { get, nth, remove } from "lodash";
import * as path from "path";
import * as vscode from "vscode";
import { DirectMethodError, DirectMethodErrorDetail } from "../Data/IotHubData";
import { Constants } from "../Util/Constants";
import Localizer from "../Util/Localizer";
import { ErrorOption, Logger, LogLevel } from "../Util/Logger";

interface RegisteredMessage {
    name: string;
    callback?: (data?: any) => void;
}

interface PostMessage {
    name: string;
    data: any;
}

interface PostMessageInitialData {
    pageType: string;
    graphData?: any;
    editMode: boolean;
    graphInstanceData?: any;
    isHorizontal: boolean;
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
    private _registeredMessages: RegisteredMessage[] = [];

    public static createOrShow(context: vscode.ExtensionContext, pageTitle: string) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        const logger = Logger.getOrCreateOutputChannel();
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
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "build"))]
        });

        GraphEditorPanel.currentPanel = new GraphEditorPanel(panel, context.extensionPath);
        GraphEditorPanel.currentPanel.setupGraphAlignmentMessage(context);
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
            (message: PostMessage) => {
                const filteredEvents = this._registeredMessages.filter((event) => {
                    return event.name === message.name;
                });
                if (filteredEvents?.length === 1 && filteredEvents[0].callback) {
                    filteredEvents[0].callback(message.data);
                }
            },
            null,
            this._disposables
        );
    }

    public waitForPostMessage(message: RegisteredMessage) {
        remove(this._registeredMessages, (event) => {
            return event.name === message.name;
        });

        this._registeredMessages.push(message);
    }

    public setupInitialMessage(data: PostMessageInitialData) {
        this.waitForPostMessage({
            name: Constants.PostMessageNames.getInitialData,
            callback: () => {
                this.postMessage({
                    name: Constants.PostMessageNames.setInitialData,
                    data: data
                });
            }
        });
    }

    public isGraphAlignedToHorizontal(context: vscode.ExtensionContext) {
        const graphAlignmentInfo: any = context.globalState.get(Constants.LvaGlobalStateGraphAlignKey);
        return graphAlignmentInfo?.isHorizontal ?? true;
    }

    public setupGraphAlignmentMessage(context: vscode.ExtensionContext) {
        this.waitForPostMessage({
            name: Constants.PostMessageNames.setGraphAlignment,
            callback: (isHorizontal: boolean) => {
                context.globalState.update(Constants.LvaGlobalStateGraphAlignKey, {
                    horizontal: isHorizontal
                });
            }
        });
    }

    public setupNameCheckMessage(checkNameAvailability: (name: string) => boolean) {
        this.waitForPostMessage({
            name: Constants.PostMessageNames.nameAvailableCheck,
            callback: (name: string) => {
                this.postMessage({ name: Constants.PostMessageNames.nameAvailableCheck, data: checkNameAvailability(name) });
            }
        });
    }

    public postMessage(message: PostMessage, callBackMessage?: RegisteredMessage) {
        if (callBackMessage) {
            this.waitForPostMessage(callBackMessage);
        }
        this._panel.webview.postMessage(message);
    }

    public static parseDirectMethodError(errorResponse: DirectMethodError, data?: any) {
        const errors: ErrorOption[] = [];
        if (errorResponse) {
            errors.push({ value: errorResponse.message, logLevel: LogLevel.error });
            if (errorResponse.details?.length) {
                errorResponse.details.forEach((errorDetail: DirectMethodErrorDetail) => {
                    const split = (errorDetail as any)?.target?.split(".");
                    const propertyName = nth(split, 3) as string;
                    errors.push({
                        value: `${errorDetail.message}`,
                        nodeProperty: propertyName,
                        logLevel: LogLevel.error,
                        nodeName: data && split?.length > 3 ? get(data, `${split[1]}.${split[2]}.name`) : (errorDetail as any).target
                    });
                });
            }
        }
        return errors;
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

        const fileNames = ["static/js/main.js", "static/css/main.css"];
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
