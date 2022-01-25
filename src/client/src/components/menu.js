import PropTypes from 'prop-types';
import React from 'react';
import LogoSymbol from './logo-symbol';
import MenuItem from './menu-item';
import {BottomMenuItemsConfig, TopMenuItemsConfig} from '../configs/menu-config';
import {Link, useLocation} from 'react-router-dom';
import {getMatchingRouteConfig} from '../configs/route-config';

const Menu = ({children}) => {
    const location = useLocation();

    const renderItems = (configs) => {
        return (
            <div>
                {configs.map(({icon, url, comingSoon, title}, idx) => {
                    const matchingConfig = getMatchingRouteConfig(location.pathname);
                    const isActive = location.pathname.startsWith(url) || matchingConfig.menuMatch === url;

                    return (
                        <Link key={idx} title={title} to={comingSoon ? '' : url} >
                            <MenuItem
                                className='my-4 d-flex justify-content-center align-items-center'
                                icon={icon}
                                isActive={isActive}
                                size={24}
                                comingSoon={comingSoon}
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
