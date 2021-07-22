import PropTypes from 'prop-types';
import FontIcon from './font-icon';

const BtnIcon = ({icon = '', className = '', size, onClick, disabled = false}) => {
    return (
        <button
            className={`d-flex bg-transparent p-0 ${className}`}
            disabled={disabled}
            onClick={onClick}
        >
            <FontIcon
                icon={icon}
                size={size}
            />
        </button>
    );
};

BtnIcon.propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    icon: PropTypes.string,
    onClick: PropTypes.func,
    size: PropTypes.number
};

export default BtnIcon;
