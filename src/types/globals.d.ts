interface vscode {
    postMessage(message: { command: string; text?: any }): void;
    getState();
    setState(state: any);
}

declare const vscode: vscode;
