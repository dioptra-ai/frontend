import PropTypes from 'prop-types';

const Tooltip = ({text = '', color, className}) => {
    return (
        <div className='custom-tooltip'>
            <div className={`tooltip-text bg-${color} border-${color} ${className}`}>
                {text}
            </div>
        </div>
    );
};

Tooltip.propTypes = {
    className: PropTypes.string,
    color: PropTypes.string,
    text: PropTypes.string
};


export default Tooltip;
