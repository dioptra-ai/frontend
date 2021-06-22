import React from 'react'

const FontIcon = ({icon, className, size = 15}) => (
  <span className={`Icon-${icon} ${className}`} style={{fontSize: `${size}px`}} />
)

export default FontIcon
