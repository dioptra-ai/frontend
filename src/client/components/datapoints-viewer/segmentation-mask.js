import React, {useRef, useState} from 'react';
import PropTypes from 'prop-types';

import {getHexColor} from 'helpers/color-helper';
import Canvas from 'components/canvas';

const HOVER_OPACITY = 0.5;

const SegmentationMask = ({mask, classNames}) => {
    const numRows = mask.length;
    const numCols = mask[0].length;
    const canvasRef = useRef(null);
    const [currentClassName, setCurrentClassName] = useState(null);
    const getClassName = (row, col) => {
        if (classNames?.[mask[row][col]]) {
            return classNames[mask[row][col]];
        } else {
            return String(mask[row][col]);
        }
    };

    const onMouseMove = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        // Compute the name of the class under the mouse. Should also work when the canvas is zoomed in.
        const canvasHeight = rect.bottom - rect.top;
        const canvasWidth = rect.right - rect.left;
        const row = Math.max(0, Math.floor((e.clientY - rect.top) / canvasHeight * numRows));
        const col = Math.max(0, Math.floor((e.clientX - rect.left) / canvasWidth * numCols));
        const className = getClassName(row, col);

        // If the class name under the mouse has not changed, do nothing.
        if (currentClassName !== className) {
            const canvasContext = canvas.getContext('2d');

            canvasContext.clearRect(0, 0, canvas.width, canvas.height);

            // For each pixel in the mask, if it is part of the class
            // under the mouse, draw it with a 50% opacity. Otherwise,
            // draw it with a 0% opacity.
            mask.forEach((row, i) => {
                row.forEach((col, j) => {
                    const currentClassName = getClassName(i, j);
                    const opacity = currentClassName === className ? HOVER_OPACITY : 0;

                    canvasContext.fillStyle = getHexColor(currentClassName, opacity);
                    canvasContext.fillRect(j, i, 1, 1);
                });
            });

            setCurrentClassName(className);
        }
    };

    const resetCanvas = (ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        mask.forEach((row, i) => {
            row.forEach((col, j) => {
                ctx.fillStyle = getHexColor(getClassName(i, j), HOVER_OPACITY);
                ctx.fillRect(j, i, 1, 1);
            });
        });
    };

    // On mouseleave, redraw the canvas with 50% opacity for all pixels.
    const onMouseLeave = () => {
        resetCanvas(canvasRef.current.getContext('2d'));
        setCurrentClassName(null);
    };

    return (
        <>
            <Canvas ref={canvasRef.current} draw={(ctx, ref) => {

                ctx.canvas.width = numCols;
                ctx.canvas.height = numRows;
                canvasRef.current = ref.current;

                resetCanvas(ctx);
            }} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} style={{width: '100%', height: '100%'}}/>
            {currentClassName ? (
                <div className='p-2 position-absolute' style={{
                    bottom: 0,
                    backgroundColor: 'white',
                    color: getHexColor(currentClassName)
                }}>{currentClassName}</div>
            ) : null}
        </>
    );
};

SegmentationMask.propTypes = {
    mask: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    classNames: PropTypes.arrayOf(PropTypes.string)
};

export default SegmentationMask;
