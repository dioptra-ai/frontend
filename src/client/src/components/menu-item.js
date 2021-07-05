import React from 'react';
import FontIcon from './font-icon';
import PropTypes from 'prop-types';

const MenuItem = ({icon, isActive, size, className}) => {
    return (
        <div className={`${className} menu-item`}>
            <FontIcon
                className={`text-${isActive ? 'primary' : 'dark'}`}
                icon={icon}
                size={size}
            />
        </div>
    );
};

MenuItem.propTypes = {
    className: PropTypes.string,
    icon: PropTypes.string,
    isActive: PropTypes.bool,
    size: PropTypes.number
};

export default MenuItem;
