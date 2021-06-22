import React from 'react'
import Image from 'react-bootstrap/Image'
import LogoSVG from '../assets/images/logo/logo.svg'

const Logo = ({width = 80, height = 80, className = ''}) => (
  <Image src={LogoSVG} width={width} height={height} className={className} />
)

export default Logo
