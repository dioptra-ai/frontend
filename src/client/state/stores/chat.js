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

        return [{
            role: 'system',
            content: 'Your name is DataBot.'
        }, ...this.m];
    }

    setIsOpen(isOpen) {
        this.isOpen = isOpen;
    }

    addMessage(role, content) {
        this.m = [...this.m, {role, content}];
    }

    sendUserMessage(content) {
        if (!this.isOpen) {
            this.setIsOpen(true);
            toggleWidget();
        }

        addUserMessage(content);

        this.addMessage('user', content);
        this.getChatResponse();
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
