import {Widget as ReactChatWidget} from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import theme from 'styles/theme.module.scss';

const ChatBot = () => {

    return (
        <>
            <style>{`
            .rcw-launcher {
                background-color: ${theme.primary};
            }
            .rcw-conversation-container > .rcw-header {
                background-color: ${theme.primary};
            }
            .rcw-message-text {
                background-color: ${theme.light};
                color: ${theme.dark};
            }
            .rcw-message > .rcw-response {
                background-color: ${theme.primary};
                color: white;
            }`}</style>
            <ReactChatWidget
                title='Data Chatbot'
                subtitle='Ask me anything!'
                handleNewUserMessage={(message) => {
                    console.log('~/dioptra/services/frontend/src/client/components/datapoints-viewer/index.js:75 > ', message);
                }}
            />
        </>
    );
};


export default ChatBot;
