import PropTypes from 'prop-types';
import {Widget as ReactChatWidget} from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import {BsChatRightDots} from 'react-icons/bs';

import {setupComponent} from 'helpers/component-helper';

import theme from 'styles/theme.module.scss';

const _ChatBot = ({chatStore}) => {

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
            .rcw-message > .rcw-message-text {
                background-color: ${theme.primary};
                color: white;
            }`}</style>
            <ReactChatWidget
                title='DataBot'
                subtitle={null}
                handleToggle={(isOpen) => chatStore.setIsOpen(isOpen)}
                handleNewUserMessage={(content) => {
                    chatStore.addMessage('user', content);
                    chatStore.getChatResponse();
                }}
            />
        </>
    );
};

_ChatBot.propTypes = {
    chatStore: PropTypes.object.isRequired
};

const ChatBot = setupComponent(_ChatBot);

export default ChatBot;

const SendButton = ({chatStore, message}) => (
    <a onClick={() => chatStore.sendUserMessage(message)}>
        <BsChatRightDots />
    </a>
);

SendButton.propTypes = {
    chatStore: PropTypes.object.isRequired,
    message: PropTypes.string.isRequired
};

ChatBot.SendButton = setupComponent(SendButton);
