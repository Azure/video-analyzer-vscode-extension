import * as path from "path";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("lvaTopologyEditor.start", () => {
      GraphEditorPanel.createOrShow(context.extensionPath);
    })
  );

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(GraphEditorPanel.viewType, {
      async deserializeWebviewPanel(
        webviewPanel: vscode.WebviewPanel,
        state: any
      ) {
        GraphEditorPanel.revive(webviewPanel, context.extensionPath);
      },
    });
  }
}

/**
 * Manages graph editor webview panels
 */
class GraphEditorPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: GraphEditorPanel | undefined;

  public static readonly viewType = "lvaTopologyEditor";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionPath: string) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (GraphEditorPanel.currentPanel) {
      GraphEditorPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      GraphEditorPanel.viewType,
      "LVA Graph Topology",
      column || vscode.ViewColumn.One,
      {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `build` directory.
        localResourceRoots: [
          vscode.Uri.file(path.join(extensionPath, "build")),
        ],
      }
    );

    GraphEditorPanel.currentPanel = new GraphEditorPanel(panel, extensionPath);
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
    this._panel.title = "LVA Graph Topology";
    this._panel.webview.html = this._getHtmlForWebview();
  }

  private _getResourceInjection(
    nonce: string,
    ending: string,
    template: (uri: vscode.Uri) => string
  ) {
    const webview = this._panel.webview;
    // from the VS Code example, seems to have to be this way instead import
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const manifest = require(path.join(
      this._extensionPath,
      "build",
      "asset-manifest.json"
    ));
    const fileNames = manifest.entrypoints.filter((fileName: string) =>
      fileName.endsWith("." + ending)
    );

    return fileNames
      .map((fileName: string) => {
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.file(
          path.join(this._extensionPath, "build", fileName)
        );

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

    const stylesheetInjection = this._getResourceInjection(
      nonce,
      "css",
      (uri) => `<link nonce="${nonce}" href="${uri}" rel="stylesheet">`
    );

    const scriptInjection = this._getResourceInjection(
      nonce,
      "js",
      (uri) => `<script nonce="${nonce}" src="${uri}"></script>`
    );

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
        <title>LVA Graph Topology</title>
        ${stylesheetInjection}
      </head>
      <body>
        <div id="root"></div>
        ${scriptInjection}
      </body>
      </html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
