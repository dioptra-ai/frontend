import {useEffect, useState} from 'react';
import {HeatMapGrid} from 'react-grid-heatmap';
import PropTypes from 'prop-types';

const HEATMAP_X_AXIS_LENGTH = 20;
const HEATMAP_Y_AXIS_LENGTH = 20;

const min = (n, m) => (n < m ? n : m);
const max = (n, m) => (n > m ? n : m);

const inRange = (num, min, max) => num >= min && num <= max;

const HeatMap = ({data, setHeatMapSamples}) => {
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [shiftPressed, setShiftPressed] = useState(false);
    const [samples, setSamples] = useState([]);

    const [refTopLeft, setRefTopLeft] = useState(null);
    const [refBottomRight, setRefBottomRight] = useState(null);
    const [multiSelect, setMultiSelect] = useState(false);

    useEffect(() => {
        setHeatMapSamples(samples);
    }, [samples]);

    const heatmapData = new Array(HEATMAP_Y_AXIS_LENGTH)
        .fill([])
        .map((_, i) => new Array(HEATMAP_X_AXIS_LENGTH)
            .fill(0)
            .map((_, j) => data.find(({x, y}) => y === i && x === j)?.outlier || 0));

    const handleKeyDown = ({keyCode}) => {
        if (keyCode === 16) setShiftPressed(true);
    };

    const handleKeyUp = ({keyCode}) => {
        if (keyCode === 16) setShiftPressed(false);
    };

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

        setSelectedPoint(outlierData);
        if (shiftPressed) {
            setSamples([...samples, ...(outlierData?.samples || [])]);
        } else setSamples([...(outlierData?.samples || [])]);
    };

    const handleMouseUp = () => {
        const x1 = min(refTopLeft?.x, refBottomRight?.x);
        const x2 = max(refTopLeft?.x, refBottomRight?.x);
        const y1 = min(refTopLeft?.y, refBottomRight?.y);
        const y2 = max(refTopLeft?.y, refBottomRight?.y);

        if (x1 && y1 && x2 && y2) {
            const filteredData = data.filter(
                ({x, y}) => inRange(x, x1, x2) && inRange(y, y1, y2)
            );

            const multiSamples = filteredData.reduce(
                (samples, d) => [...samples, ...(d.samples || [])],
                []
            );

            setSamples(multiSamples);
        }
        setMultiSelect(false);
    };


    return (
        <div className='heat-map'>
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
                        disabled={!value}
                        onMouseDown={() => {
                            if (x && y) {
                                setRefTopLeft({x, y});
                                setMultiSelect(true);
                                setRefBottomRight(null);
                            }
                        }}
                        onMouseUp={handleMouseUp}
                        onMouseMove={() => {
                            if (multiSelect) setRefBottomRight({x, y});
                        }}
                        className={`heat-map-cell ${
                            x === selectedPoint?.y && y === selectedPoint?.x ?
                                'heat-map-cell-active' :
                                ''
                        }`}
                        style={{
                            cursor: value ? 'pointer' : 'not-allowed',
                            background:
                value <= 50 ?
                    `rgba(31, 169, 200, ${value / 50})` :
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
            {refTopLeft && refBottomRight && (
                <div
                    className='heat-map-refArea bg-white-blue'
                    style={{
                        top: `${refTopLeft?.y}vw`,
                        left: `${refTopLeft?.x}vw`,
                        width: `${Math.abs(refBottomRight?.y - refTopLeft?.x)}vw`,
                        height: `${Math.abs(refBottomRight?.y - refTopLeft?.x)}vw`
                    }}
                />
            )}
        </div>
    );
};

HeatMap.propTypes = {
    data: PropTypes.array.isRequired,
    setHeatMapSamples: PropTypes.func.isRequired
};

export default HeatMap;
