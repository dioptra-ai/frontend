import {makeAutoObservable} from 'mobx';
import {addResponseMessage, addUserMessage, toggleMsgLoader, toggleWidget} from 'react-chat-widget';
import baseJSONClient from 'clients/base-json-client';

class ChatStore {
    messages = [];

    isOpen = false;

    constructor() {
        makeAutoObservable(this);
    }

    setIsOpen(isOpen) {
        this.isOpen = isOpen;
    }

    addMessage(role, content) {
        this.messages = [...this.messages, {role, content}];
    }


    sendUserMessage(content) {
        if (!this.isOpen) {
            this.setIsOpen(true);
            toggleWidget();
        }

        addUserMessage(content);

        this.addMessage('user', content);
    }

    async getChatResponse() {
        toggleMsgLoader();

        try {
            const responseMessage = await baseJSONClient.post('/api/chat/send', {
                messages: this.messages
            });

            addResponseMessage(responseMessage.content);
            this.addMessage('assistant', responseMessage.content);
        } catch (e) {
            console.error(e);
        } finally {
            toggleMsgLoader();
        }
    }
}

export const chatStore = new ChatStore();
