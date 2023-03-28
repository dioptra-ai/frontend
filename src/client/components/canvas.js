import Color from 'color';
import {useEffect, useRef} from 'react';
import {PropTypes} from 'prop-types';

const useCanvas = (draw, options = {}) => {

    const canvasRef = useRef(null);

    useEffect(() => {

        const canvas = canvasRef.current;
        const context = canvas.getContext(options.context || '2d');

        const render = () => {

            draw(context, canvasRef);
        };

        render();

    }, []);

    return canvasRef;
};

export class AdressableImageData extends ImageData {
    constructor(canvas) {
        super(canvas.width, canvas.height);
        this.ctx = canvas.getContext('2d');
    }

    setPixel(x, y, color) {
        const rgbaColor = Color(color).rgb().array();
        const index = (y * this.width + x) * 4;

        this.data[index] = rgbaColor[0];
        this.data[index + 1] = rgbaColor[1];
        this.data[index + 2] = rgbaColor[2];
        this.data[index + 3] = rgbaColor[3];
    }

    draw() {
        console.log('~/dioptra/services/frontend/src/client/components/canvas.js:43 > ', 'putimagedata');
        this.ctx.putImageData(this, 0, 0);
    }
}

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
