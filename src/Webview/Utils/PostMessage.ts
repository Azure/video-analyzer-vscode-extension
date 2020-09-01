import remove from "lodash/remove";

interface RegisteredMessage {
    name: string;
    onlyOnce: boolean;
    callback?: (data?: any, args?: any) => void;
    optionalParams?: any;
}

interface PostMessageInitialData {
    pageType: string;
    graphData?: any;
    graphInstance?: any;
}

interface Message {
    name: string;
    data?: any;
}

export interface ParentWindow {
    postMessage(message: Message): void;
}

export default class PostMessage {
    public static _registeredMessages: RegisteredMessage[] = [];
    public static parent: ParentWindow;

    public static RegisterPostMessageParent(parentWindow: any) {
        this.parent = parentWindow;

        window.addEventListener("message", (event) => {
            const message: Message = event.data;
            const filteredEvents = this._registeredMessages.filter((currentMessage) => {
                return currentMessage.name === message.name;
            });
            const currentEvent = filteredEvents?.length && filteredEvents[0];
            if (currentEvent && currentEvent.callback) {
                if (currentEvent.onlyOnce) {
                    remove(this._registeredMessages, (currentMessage) => {
                        return currentMessage.name === message.name;
                    });
                }
                currentEvent.callback.apply(null, [message.data, currentEvent.optionalParams]);
            }
        });
    }

    public static waitForPostMessage(message: RegisteredMessage) {
        this._registeredMessages.push(message);
    }

    public static sendMessageToParent(message: Message, callBackMessage?: RegisteredMessage) {
        if (this.parent) {
            if (callBackMessage) {
                this.waitForPostMessage(callBackMessage);
            }
            this.parent.postMessage(message);
        }
    }
}
