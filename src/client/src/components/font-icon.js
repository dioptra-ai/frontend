import React from 'react';
import PropTypes from 'prop-types';

const FontIcon = ({icon = '', className = '', size = 15, onClick}) => (
    <span className={`Icon-${icon} ${className}`} onClick={onClick} style={{fontSize: `${size}px`, cursor: onClick ? 'pointer' : ''}}/>
);

FontIcon.propTypes = {
    className: PropTypes.string,
    icon: PropTypes.string,
    onClick: PropTypes.func,
    size: PropTypes.number
};

export default FontIcon;
