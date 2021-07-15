import PropTypes from 'prop-types';

const Modal = ({children}) => {
    return (
        <div className='custom-modal d-flex justify-content-center align-items-center p-3'>
            <div className='custom-modal-content bg-white rounded py-5 px-4'>
                {children}
            </div>
        </div>
    );
};

Modal.propTypes = {
    children: PropTypes.array
};

export default Modal;
