import PropTypes from 'prop-types';
import Modal from 'react-modal';
import {IoCloseOutline} from 'react-icons/io5';
import Color from 'color';

import theme from 'styles/theme.module.scss';

Modal.setAppElement('#root');

const ModalComponent = ({onClose, isOpen = true, title = ' ', closeButton, children}) => {
    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} style={{
            content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                border: 'none',
                boxShadow: `0 0 10px 0 ${Color(theme.dark).alpha(0.4).string()}`,
                marginRight: '-45%',
                transform: 'translate(-50%, -50%)',
                maxHeight: '95vh',
                maxWidth: '95vw',
                minWidth: '30vw',
                paddingTop: 0
            },
            overlay: {
                zIndex: 20
            }
        }}>
            <div className='d-flex flex-column p-3'>
                <div
                    className='d-flex justify-content-between align-items-center position-sticky top-0 bg-white'
                    style={{zIndex: 1}}
                >
                    <div className='text-dark m-0 bold-text flex-grow-1 fs-4'>{title}</div>
                    {closeButton ? closeButton : (
                        <button className='text-dark border-0 bg-white fs-2' onClick={onClose}>
                            <IoCloseOutline/>
                        </button>
                    )}
                </div>
                <div className='flex-grow-1'>
                    {children}
                </div>
            </div>
        </Modal>
    );
};

ModalComponent.propTypes = {
    children: PropTypes.node,
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    title: PropTypes.node,
    closeButton: PropTypes.node
};

export default ModalComponent;
