import React from 'react';
import PropTypes from 'prop-types';

const FontIcon = ({icon = '', className = '', size = 15}) => (
    <span className={`Icon-${icon} ${className}`} style={{fontSize: `${size}px`}} />
);

FontIcon.propTypes = {
    className: PropTypes.string,
    icon: PropTypes.string,
    size: PropTypes.number
};

export default FontIcon;
