import {useEffect, useState} from 'react';
import {HeatMapGrid} from 'react-grid-heatmap';
import PropTypes from 'prop-types';
import {useThrottle} from '@react-hook/throttle';
import _ from 'lodash';

import {SpinnerWrapper} from 'components/spinner';

const inRange = (num, min, max) => num >= min && num <= max;

const HeatMap = ({data, numCellsH, numCellsW, setHeatMapSamples, selectedSamples}) => {
    const [selectedPoints, setSelectedPoints] = useThrottle([], 25, true);
    const [shiftPressed, setShiftPressed] = useState(false);

    const [refTopLeft, setRefTopLeft] = useThrottle(null, 25, true);
    // const [refBottomRight, setRefBottomRight] = useThrottle(null, 25, true);
    const [multiSelect, setMultiSelect] = useState(false);

    const samples = selectedPoints?.reduce(
        (combinedSamples, {samples}) => [...combinedSamples, ...samples],
        []
    );

    const heatmapData = new Array(numCellsH).fill()
        .map((_, i) => new Array(numCellsW).fill()
            .map((_, j) => data.find(({x, y}) => y === i && x === j)?.outlier || 0));

    const handleKeyDown = ({keyCode}) => {
        if (keyCode === 16) setShiftPressed(true);
    };

    const handleKeyUp = ({keyCode}) => {
        if (keyCode === 16) setShiftPressed(false);
    };

    useEffect(() => {

        if (!_.isEqual(selectedSamples, samples)) {
            setHeatMapSamples(samples);
        }
    }, [samples, selectedSamples]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleClick = (_x, _y) => {
        const outlierData = data.find(({x, y}) => x === _y && y === _x);

        if (outlierData) {
            if (shiftPressed) {
                const pointExists = selectedPoints.find(
                    ({x, y}) => outlierData.x === x && outlierData.y === y
                );

                if (!pointExists) {
                    setSelectedPoints([...selectedPoints, outlierData]);
                }
            } else setSelectedPoints([...[outlierData]]);
        }
    };

    const handleMouseMove = (x, y) => {
        // setRefBottomRight({x, y});
        const x1 = Math.min(refTopLeft?.x, x);
        const x2 = Math.max(refTopLeft?.x, x);
        const y1 = Math.min(refTopLeft?.y, y);
        const y2 = Math.max(refTopLeft?.y, y);

        if (x1 >= 0 && y1 >= 0 && x2 >= 0 && y2 >= 0) {
            const filteredData = data.filter(
                ({x, y}) => inRange(x, y1, y2) && inRange(y, x1, x2)
            );

            setSelectedPoints([...filteredData]);
        }
    };

    const handleMouseUp = () => {
        setMultiSelect(false);
    };

    return (
        <div className='heat-map'>
            <SpinnerWrapper>
                <HeatMapGrid
                    data={heatmapData}
                    cellStyle={() => ({
                        width: '1vw',
                        height: 'auto',
                        aspectRatio: '1/1',
                        borderRadius: 0,
                        borderWidth: '1px 1px 1px 1px',
                        borderStyle: 'dashed',
                        borderColor: '#E5E5E5',
                        background: 'none'
                    })}
                    cellRender={(x, y, value) => (
                        <button
                            onMouseDown={() => {
                                if (x >= 0 && y >= 0 && value >= 0) {
                                    setRefTopLeft({x, y});
                                    setMultiSelect(true);
                                    // setRefBottomRight(null);
                                }
                            }}
                            onMouseUp={() => {
                                if (value >= 0) handleMouseUp();
                            }}
                            onMouseMove={() => {
                                if (multiSelect && value >= 0) handleMouseMove(x, y);
                            }}
                            className={`heat-map-cell ${
                                selectedPoints.find((point) => point.x === y && point.y === x) ?
                                    'heat-map-cell-active' :
                                    ''
                            }`}
                            style={{
                                background: value === 0 ? 'transparent' :
                                    value <= 50 ?
                                        `rgba(31, 169, 200, ${1 - (value / 50)})` :
                                        `rgba(248, 136, 108, ${value / 100})`
                            }}
                        />
                    )}
                    onClick={handleClick}
                />
                <div className='w-100 my-4 d-flex'>
                    <div className='d-flex align-items-center'>
                        <div className='heat-map-legend heat-map-legend_red' />
                        <span className='text-secondary heat-map-legend-text'>Outlier</span>
                    </div>
                    <div className='d-flex align-items-center'>
                        <div className='heat-map-legend heat-map-legend_blue' />
                        <span className='text-secondary heat-map-legend-text'>Non-Outlier</span>
                    </div>
                </div>
            </SpinnerWrapper>
        </div>
    );
};

HeatMap.propTypes = {
    data: PropTypes.array.isRequired,
    setHeatMapSamples: PropTypes.func.isRequired,
    selectedSamples: PropTypes.array.isRequired,
    numCellsH: PropTypes.number.isRequired,
    numCellsW: PropTypes.number.isRequired
};

export default HeatMap;
