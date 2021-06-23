import React from 'react'
import Image from 'react-bootstrap/Image'
import LogoSymbolSVG from '../assets/images/logo/logo_symbol.svg'

const LogoSymbol = ({width = 80, height = 80, className = ''}) => (
  <Image src={LogoSymbolSVG} width={width} height={height} className={className} />
)

export default LogoSymbol
