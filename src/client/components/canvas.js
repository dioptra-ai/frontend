import React from 'react';
import {PropTypes} from 'prop-types';

import useCanvas from 'hooks/use-canvas';

const Canvas = ({draw, options = {}, ...rest}) => {

    const {context} = options;
    const canvasRef = useCanvas(draw, {context});

    return <canvas ref={canvasRef} {...rest} style={{width: '100%', height: '100%'}}/>;
};

Canvas.propTypes = {
    draw: PropTypes.func.isRequired,
    options: PropTypes.object
};

export default Canvas;
