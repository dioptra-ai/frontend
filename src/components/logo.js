import React from 'react';
import Image from 'react-bootstrap/Image';
import LogoSVG from '../assets/images/logo/logo.svg';
import PropTypes from 'prop-types';

const Logo = ({width = 80, height = 80, className = ''}) => (
    <Image className={className} height={height} src={LogoSVG} width={width} />
);

Logo.propTypes = {
    className: PropTypes.string,
    height: PropTypes.number,
    width: PropTypes.number
};

export default Logo;
