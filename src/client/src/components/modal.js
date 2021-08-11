import PropTypes from 'prop-types';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
};

const ModalComponent = ({onClose, isOpen, children}) => {
    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles}>
            {/* <div className='rounded p-4'> */}
            {children}
            {/* </div> */}
        </Modal>
    );
};

ModalComponent.propTypes = {
    children: PropTypes.array,
    isOpen: PropTypes.bool,
    onClose: PropTypes.func
};

export default ModalComponent;
