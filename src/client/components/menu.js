import PropTypes from 'prop-types';
import React from 'react';
import LogoSymbol from './logo-symbol';
import {Link, useLocation} from 'react-router-dom';
import {AiFillDatabase} from 'react-icons/ai';
import {Paths, getMatchingRouteConfig} from 'configs/route-config';
import {IconNames} from 'constants';
import FontIcon from './font-icon';
import {MdHelpOutline} from 'react-icons/md';

const MenuItem = ({icon, isActive, size, className}) => {
    return (
        <div className={`${className} menu-item`}>
            <span className={`left-border bg-${isActive ? 'primary' : 'transparent'}`}></span>
            <div className={`text-${isActive ? 'primary' : (icon === 'User' ? 'secondary' : 'dark')}`}>
                {
                    typeof icon === 'string' ? (
                        <FontIcon
                            icon={icon}
                            size={size}
                        />
                    ) : icon
                }
            </div>
        </div>
    );
};

MenuItem.propTypes = {
    className: PropTypes.string,
    icon: PropTypes.node,
    isActive: PropTypes.bool,
    size: PropTypes.number
};

const TopMenuItemsConfig = [
    {icon: IconNames.MODELS, url: Paths().MODELS, title: 'Models'},
    {icon: IconNames.EXPERIMENTATIONS, url: Paths().EXPERIMENTATIONS, title: 'Experimentations'},
    {icon: <AiFillDatabase className='fs-3'/>, url: '/dataset', title: 'Datasets'}
];

const BottomMenuItemsConfig = [
    {icon: <MdHelpOutline className='fs-3'/>, url: '/documentation', title: 'Documentation'},
    {icon: IconNames.SETTING, url: Paths().SETTINGS, title: 'Settings'},
    {icon: IconNames.USER, url: Paths().PROFILE, title: 'User'}
];

const Menu = ({children}) => {
    const location = useLocation();

    const renderItems = (configs) => {
        return (
            <div>
                {configs.map(({icon, url, title}, idx) => {
                    const matchingConfig = getMatchingRouteConfig(location.pathname);
                    const isActive = location.pathname.startsWith(url) || matchingConfig.menuMatch === url;

                    return (
                        <Link key={idx} title={title} to={url} >
                            <MenuItem
                                className='my-4 d-flex justify-content-center align-items-center'
                                icon={icon}
                                isActive={isActive}
                                size={24}
                            />
                        </Link>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <div className='menu py-3 d-flex flex-column'>
                <div className='d-flex justify-content-center'>
                    <LogoSymbol height={38} width={41}/>
                </div>
                <div className='d-flex flex-column justify-content-between flex-grow-1 my-2'>
                    <div>{renderItems(TopMenuItemsConfig)}</div>
                    <div>{renderItems(BottomMenuItemsConfig)}</div>
                </div>
            </div>
            <div className='px-0 bg-white authorized-content'>{children}</div>
        </>
    );
};

Menu.propTypes = {
    children: PropTypes.node
};

export default Menu;
