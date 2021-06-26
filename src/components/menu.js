import React from 'react';
import LogoSymbol from './logo-symbol';
import MenuItem from './menu-item';
import {BottomMenuItemsConfig, TopMenuItemsConfig} from '../configs/menu-config';
import {Link, useLocation} from 'react-router-dom';

const Menu = () => {
    const location = useLocation();

    const renderItems = (configs) => {
        return (
            <div>
                {configs.map(({icon, url}, idx) => {
                    return (
                        <Link key={idx} to={url}>
                            <MenuItem
                                className='my-5 d-flex justify-content-center'
                                icon={icon}
                                isActive={location.pathname.startsWith(url)}
                                size={35}
                            />
                        </Link>
                    );
                })}
            </div>
        );
    };

    return (
        <div className='menu py-3 d-flex flex-column'>
            <div className='d-flex justify-content-center'>
                <LogoSymbol width={40} />
            </div>
            <div className='d-flex flex-column justify-content-between flex-grow-1 my-2'>
                <div>{renderItems(TopMenuItemsConfig)}</div>
                <div>{renderItems(BottomMenuItemsConfig)}</div>
            </div>
        </div>
    );
};

export default Menu;
