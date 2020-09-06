import { get, nth } from "lodash";
import { OutputChannel, ViewColumn, window } from "vscode";
import { DirectMethodError, DirectMethodErrorDetail } from "../Data/IotHubData";

const enum LogLevel {
    error = "error",
    info = "info",
    warn = "warning"
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

    public appendLog(value: string, options?: { logLevel?: string; target?: string; date?: Date }): void {
        // tslint:disable: strict-boolean-expressions
        options = options || {};
        const date: Date = options.date || new Date();
        this.appendLine(
            `[${date.toLocaleTimeString()}] [Live video analytics]${options.logLevel ? " " + options.logLevel : ""}${
                options.target ? ` [target: ${options.target}]` : ""
            }: ${value}`
        );
    }

    public logError(errorString: string, errorResponse: DirectMethodError, data?: any) {
        this.appendLog(errorString, { logLevel: LogLevel.error });
        if (errorResponse) {
            this.appendLog(errorResponse.message, { logLevel: LogLevel.error });
            if (errorResponse.details?.length) {
                errorResponse.details.forEach((errorDetail: DirectMethodErrorDetail) => {
                    const split = (errorDetail as any).target.split(".");
                    const propertyName = nth(split, 3);
                    this.appendLog(`${propertyName ? "[Property: " + propertyName + "] " : ""} ${errorDetail.message}`, {
                        logLevel: LogLevel.error,
                        target: data && split?.length > 3 ? get(data, `${split[1]}.${split[2]}.name`) : (errorDetail as any).target
                    });
                });
            }
        }
        this.show();
        this.showErrorNotification(errorString, errorResponse);
    }

    public showErrorNotification(errorString: string, errorDetails: any) {
        window.showErrorMessage(errorString, { modal: true });
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
