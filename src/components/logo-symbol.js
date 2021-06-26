import React from 'react';
import Image from 'react-bootstrap/Image';
import LogoSymbolSVG from '../assets/images/logo/logo_symbol.svg';
import PropTypes from 'prop-types';

const LogoSymbol = ({width = 80, height = 80, className = ''}) => (
    <Image className={className} height={height} src={LogoSymbolSVG} width={width} />
);

LogoSymbol.propTypes = {
    className: PropTypes.string,
    height: PropTypes.number,
    width: PropTypes.number
};

export default LogoSymbol;
