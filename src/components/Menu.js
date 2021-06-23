import React from 'react'
import LogoSymbol from './LogoSymbol'
import MenuItem from './MenuItem'
import {BottomMenuItemsConfig, TopMenuItemsConfig} from '../configs/menuConfig'
import {Link, useLocation} from 'react-router-dom'

const Menu = () => {
  const location = useLocation()

  const renderItems = (configs) => {
    return (
      <div>
        {configs.map(({icon, url}, idx) => {
          return (
            <Link to={url} key={idx}>
              <MenuItem
                icon={icon}
                size={35}
                isActive={location.pathname.startsWith(url)}
                className="my-5 d-flex justify-content-center"
              />
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className="menu py-3 d-flex flex-column">
      <div className="d-flex justify-content-center">
        <LogoSymbol width={40} />
      </div>
      <div className="d-flex flex-column justify-content-between flex-grow-1 my-2">
        <div>{renderItems(TopMenuItemsConfig)}</div>
        <div>{renderItems(BottomMenuItemsConfig)}</div>
      </div>
    </div>
  )
}

export default Menu
