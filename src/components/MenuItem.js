import React from 'react'
import FontIcon from './FontIcon'

const MenuItem = ({icon, isActive, size, className}) => {
  return (
    <div className={`${className} menu-item`}>
      <FontIcon
        icon={icon}
        size={size}
        className={`text-${isActive ? 'primary' : 'dark'}`}
      />
    </div>
  )
}

export default MenuItem
