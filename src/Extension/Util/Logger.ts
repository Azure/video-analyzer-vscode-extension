import { get, nth } from "lodash";
import { OutputChannel, ViewColumn, window } from "vscode";
import { DirectMethodError, DirectMethodErrorDetail } from "../Data/IotHubData";

export const enum LogLevel {
    error = "error",
    info = "info",
    warn = "warning"
}

export interface ErrorOption {
    value: string;
    logLevel?: string;
    nodeName?: string;
    nodeProperty?: string;
    date?: Date;
}

export class Logger {
    public readonly name: string;
    public readonly extensionPrefix: string;
    private _outputChannel: OutputChannel;

    private static _outputChanelObj: Logger;

    public static getOrCreateOutputChannel() {
        if (!this._outputChanelObj) {
            this._outputChanelObj = new Logger("Live Video Analytics", "lva-edge-vscode-extension");
        }
        return this._outputChanelObj;
    }

    constructor(name: string, extensionPrefix: string) {
        this.name = name;
        this.extensionPrefix = extensionPrefix;
        this._outputChannel = window.createOutputChannel(this.name);
    }

    public append(value: string): void {
        this._outputChannel.append(value);
    }

    public appendLine(value: string): void {
        this._outputChannel.appendLine(value);
    }

    public appendLog(options: ErrorOption): void {
        const date: Date = options.date || new Date();
        this.appendLine(
            `[${date.toLocaleTimeString()}] [Live video analytics]${options.logLevel ? " " + options.logLevel : ""}${
                options.nodeName ? ` [target: ${options.nodeName}]:` : ""
            } ${options.nodeProperty ? ` [property: ${options.nodeProperty}]:` : ""} ${options.value}`
        );
    }

    public logError(errorString: string, errors: ErrorOption[], showModal: boolean = true) {
        this.appendLog({ value: errorString, logLevel: LogLevel.error });
        if (errors?.length) {
            errors.forEach((error) => {
                this.appendLog(error);
            });
            this.show();
            this.showErrorNotification(errorString, errors.join(","), showModal);
        }
    }

    public showErrorNotification(errorString: string, errorDetails: string, showModal: boolean) {
        window.showErrorMessage(errorString, { modal: showModal });
    }

    public clear(): void {
        this._outputChannel.clear();
    }

    public show(preserveFocus?: boolean | undefined): void;
    public show(column?: ViewColumn | undefined, preserveFocus?: boolean | undefined): void;
    public show(_column?: any, preserveFocus?: boolean | undefined): void {
        this._outputChannel.show(preserveFocus);
    }

    public hide(): void {
        this._outputChannel.hide();
    }

    public dispose(): void {
        this._outputChannel.dispose();
    }
}
