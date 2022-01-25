import React from 'react';
import PropTypes from 'prop-types';
import FontIcon from './font-icon';
import fontSizes from 'styles/font-sizes.module.scss';

const MenuItem = ({icon, isActive, size, className, comingSoon}) => {
    return (
        <div className={`${className} menu-item`}>
            <span className={`left-border bg-${isActive ? 'primary' : 'transparent'}`}></span>
            <FontIcon
                className={`text-${isActive ? 'primary' : (icon === 'User' || comingSoon ? 'secondary' : 'dark')}`}
                icon={icon}
                size={size}
            />
            {comingSoon && <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                color: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <p style={{fontSize: fontSizes.fs_7, margin: 0}}>Coming Soon</p>
            </div>}
        </div>
    );
};

MenuItem.propTypes = {
    className: PropTypes.string,
    comingSoon: PropTypes.bool,
    icon: PropTypes.string,
    isActive: PropTypes.bool,
    size: PropTypes.number
};

export default MenuItem;
