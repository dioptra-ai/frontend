import {useEffect, useRef} from 'react';

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

export default useCanvas;
