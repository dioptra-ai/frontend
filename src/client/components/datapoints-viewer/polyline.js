import PropTypes from 'prop-types';
import {getHexColor} from 'helpers/color-helper';
import Canvas from 'components/canvas';

const Polyline = ({cocoCoordinates, className, width, height, closed = true, lineWidth = 1}) => {

    return (
        <Canvas style={{width: '100%', height: '100%'}}
            draw={(ctx) => {
                const xCoordinates = cocoCoordinates.filter((_, i) => i % 2 === 0);
                const yCoordinates = cocoCoordinates.filter((_, i) => i % 2 === 1);

                ctx.canvas.width = width;
                ctx.canvas.height = height;

                ctx.beginPath();
                xCoordinates.forEach((x, i) => {
                    const y = yCoordinates[i];

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                if (closed) {
                    ctx.closePath();
                    ctx.fillStyle = getHexColor(className, 0.5);
                    ctx.fill();
                }
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = getHexColor(className);
                ctx.stroke();
            }}
        />
    );
};

Polyline.propTypes = {
    cocoCoordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
    className: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    closed: PropTypes.bool,
    lineWidth: PropTypes.number
};

export default Polyline;
