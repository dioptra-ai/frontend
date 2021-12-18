import PropTypes from 'prop-types';
import Modal from 'react-modal';
import {IoCloseCircleOutline} from 'react-icons/io5';

Modal.setAppElement('#root');

const ModalComponent = ({onClose, isOpen = true, title, closeButton, children}) => {
    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} style={{
            content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-45%',
                transform: 'translate(-50%, -50%)',
                maxHeight: '90vh',
                maxWidth: '90vw',
                minWidth: '20vw',
                ...(title ? {paddingTop: 0} : null)
            },
            overlay: {
                zIndex: 20
            }
        }}>
            <div className='d-flex flex-column'>
                {title !== undefined ? (
                    <div className='d-flex align-items-center pt-2 pb-2 bg-white position-sticky top-0'>
                        <p className='text-dark m-0 bold-text flex-grow-1 fs-4'>{title}</p>
                        {closeButton ? closeButton : (
                            <button className='text-dark border-0 bg-white fs-2 p-0 ps-3' onClick={onClose}>
                                <IoCloseCircleOutline/>
                            </button>
                        )}
                    </div>
                ) : null}
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
    title: PropTypes.string,
    closeButton: PropTypes.node
};

export default ModalComponent;
