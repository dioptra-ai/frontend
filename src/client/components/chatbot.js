import PropTypes from 'prop-types';
import {Widget as ReactChatWidget} from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import {IoMdSend} from 'react-icons/io';
import {BiBot} from 'react-icons/bi';

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
                title={(
                    <div className='d-flex justify-content-center align-items-center'>
                        <BiBot className='fs-1'/>&nbsp;DataBot
                    </div>
                )}
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
    <a onClick={() => chatStore.sendUserMessage(message)} title='Send to chat' className='d-inline-flex align-items-center justify-content-center'>
        <IoMdSend />
    </a>
);

SendButton.propTypes = {
    chatStore: PropTypes.object.isRequired,
    message: PropTypes.string.isRequired
};

ChatBot.SendButton = setupComponent(SendButton);
