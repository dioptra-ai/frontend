import {useEffect, useRef} from 'react';
import {PropTypes} from 'prop-types';

const useCanvas = (draw, options = {}) => {

    const canvasRef = useRef(null);

    useEffect(() => {

        const canvas = canvasRef.current;
        const context = canvas.getContext(options.context || '2d');

        const render = () => {

            draw(context);
        };

        render();

    }, []);

    return canvasRef;
};

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
