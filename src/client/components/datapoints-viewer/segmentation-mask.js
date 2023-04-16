import {Buffer} from 'buffer';
import lz4 from 'lz4js';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {useThrottle} from '@react-hook/throttle';

import {getHexColor} from 'helpers/color-helper';
import Canvas from 'components/canvas';

const HOVER_OPACITY = 0.5;

const SegmentationMask = ({encodedMask, classNames}) => {
    const mask = useMemo(() => {
        const decodedMask = Buffer.from(encodedMask, 'base64');
        const decompressedMask = lz4.decompress(decodedMask);

        return JSON.parse(new TextDecoder('utf-8').decode(decompressedMask));
    }, [encodedMask]);
    const numRows = mask.length;
    const numCols = mask[0].length;
    const [mouseX, setMouseX] = useThrottle(null, 10, true);
    const [mouseY, setMouseY] = useThrottle(null, 10, true);
    const canvasRef = useRef(null);
    const [currentClassName, setCurrentClassName] = useState(null);
    const getClassName = (row, col) => {
        const classValue = mask[row][col];

        if (classNames) {
            return classNames[classValue];
        } else {
            return String(classValue);
        }
    };

    const resetCanvas = () => {
        const ctx = canvasRef.current.getContext('2d');

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        mask.forEach((row, i) => {
            row.forEach((col, j) => {
                const className = getClassName(i, j);

                if (!className) {
                    return;
                }

                ctx.fillStyle = getHexColor(className, HOVER_OPACITY);
                ctx.fillRect(j, i, 1, 1);
            });
        });
    };

    useEffect(resetCanvas, [encodedMask]);

    useEffect(() => {
        if (mouseX && mouseY) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            // Compute the name of the class under the mouse. Should also work when the canvas is zoomed in.
            const canvasHeight = rect.bottom - rect.top;
            const canvasWidth = rect.right - rect.left;
            const row = Math.max(0, Math.floor((mouseY - rect.top) / canvasHeight * numRows));
            const col = Math.max(0, Math.floor((mouseX - rect.left) / canvasWidth * numCols));
            const className = getClassName(row, col);

            // If the class name under the mouse has not changed, do nothing.
            if (className && currentClassName !== className) {
                const canvasContext = canvas.getContext('2d');
                const classColor = getHexColor(className, HOVER_OPACITY);

                canvasContext.clearRect(0, 0, canvas.width, canvas.height);
                canvasContext.fillStyle = classColor;

                // For each pixel in the mask, if it is part of the class
                // under the mouse, draw it with a 50% opacity. Otherwise,
                // draw it with a 0% opacity.

                mask.forEach((row, i) => {
                    row.forEach((col, j) => {
                        const pixelClassName = getClassName(i, j);

                        if (pixelClassName && pixelClassName === className) {
                            canvasContext.fillRect(j, i, 1, 1);
                        }
                    });
                });

                setCurrentClassName(className);
            }
        }
    }, [mouseX, mouseY]);

    return (
        <>
            <Canvas ref={canvasRef.current}
                draw={(ctx, ref) => {

                    ctx.canvas.width = numCols;
                    ctx.canvas.height = numRows;
                    canvasRef.current = ref.current;

                    resetCanvas();
                }}
                onMouseMove={(e) => {
                    setMouseX(e.clientX);
                    setMouseY(e.clientY);
                }}
                onMouseLeave={() => {
                    setMouseX(null);
                    setMouseY(null);
                    resetCanvas();
                    setCurrentClassName(null);
                }}
                style={{width: '100%', height: '100%'}}
            />
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
    encodedMask: PropTypes.string.isRequired,
    classNames: PropTypes.arrayOf(PropTypes.string)
};

export default SegmentationMask;
