import PropTypes from 'prop-types';
import {Widget as ReactChatWidget} from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';

import {setupComponent} from 'helpers/component-helper';

import theme from 'styles/theme.module.scss';

const ChatBot = ({chatStore}) => {

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

ChatBot.propTypes = {
    chatStore: PropTypes.object.isRequired
};

export default setupComponent(ChatBot);
