import {makeAutoObservable} from 'mobx';
import {addResponseMessage, addUserMessage, toggleMsgLoader, toggleWidget} from 'react-chat-widget';
import baseJSONClient from 'clients/base-json-client';

class ChatStore {
    m = [];

    isOpen = false;

    constructor() {
        makeAutoObservable(this);
    }

    get messages() {

        return this.m;
    }

    setIsOpen(isOpen) {
        this.isOpen = isOpen;
    }

    addMessage(role, content) {
        this.m = [...this.m, {role, content}];
    }

    async sendUserMessage(content) {
        if (!this.isOpen) {
            this.setIsOpen(true);
            toggleWidget();
        }
        // TODO - remove
        toggleMsgLoader();
        await new Promise((resolve) => setTimeout(resolve, 3000));

        addUserMessage(content);
        // TODO: remove
        toggleMsgLoader();

        this.addMessage('user', content);
        this.getChatResponse();
    }

    async getChatResponse() {
        toggleMsgLoader();

        try {
            const responseMessage = await baseJSONClient.post('/api/chat/send', {
                messages: this.messages
            });
            // Format all URLs in the response message that are preceded by a space (not formatted) to Markdown.
            const formattedResponse = responseMessage.content.replace(/(\s(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+~#?&//=]*)))/, ' [$2]($2)');

            this.addMessage('assistant', formattedResponse);
            addResponseMessage(formattedResponse);
        } catch (e) {
            console.error(e);
        } finally {
            toggleMsgLoader();
        }
    }
}

export const chatStore = new ChatStore();
