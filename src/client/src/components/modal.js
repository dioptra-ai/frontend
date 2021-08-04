import PropTypes from 'prop-types';

const Modal = ({className = '', children}) => {
    return (
        <div className='custom-modal d-flex justify-content-center align-items-center p-3'>
            <div className={`custom-modal-content ${className} p-3`}>
                {children}
            </div>
        </div>
    );
};

Modal.propTypes = {
    children: PropTypes.array,
    className: PropTypes.string
};

export default Modal;
