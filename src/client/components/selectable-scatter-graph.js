import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';
import {Scatter} from 'recharts';
import oHash from 'object-hash';

import ScatterGraph from 'components/scatter-graph';
import useCartesianPoints from 'hooks/use-cartesian-points';

const LARGE_DOT_SIZE = 200;
const SMALL_DOT_SIZE = 60;

const inRange = (num, min, max) => num >= min && num <= max;

const SelectableScatterGraph = ({scatters, onSelectedDataChange, isDatapointSelected, children}) => {
    const [shiftPressed, setShiftPressed] = useState(false);
    const [selectedPoints, setSelectedPoints] = useState([]);
    const getCartesianPointSelected = useCartesianPoints({points: selectedPoints, xLabel: 'PCA1', yLabel: 'PCA2'});

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

    const handleScatterClick = (point) => {
        let newSelectedPoints = [];

        if (shiftPressed) {
            newSelectedPoints = [...selectedPoints, point];
        } else {
            newSelectedPoints = [point];
        }

        handlePointsSelected(newSelectedPoints);
    };
    const handlePointsSelected = (points) => {

        setSelectedPoints(points);
        onSelectedDataChange?.(points);
    };


    return (
        <ScatterGraph
            onAreaSelected={({left, right, top, bottom}) => {
                if (left && top && right && bottom) {
                    const data = [].concat(...scatters.map((s) => s.data));
                    const filteredData = data.filter(
                        ({PCA1, PCA2}) => inRange(PCA1, left, right) && inRange(PCA2, top, bottom)
                    );

                    if (shiftPressed) {
                        handlePointsSelected([...selectedPoints, ...filteredData]);
                    } else {
                        handlePointsSelected([...filteredData]);
                    }
                } else if (!shiftPressed) {
                    handlePointsSelected([]);
                }
            }}
        >
            {
                scatters.map((s) => (
                    <Scatter key={oHash(s)}
                        isAnimationActive={false}
                        cursor='pointer'
                        onClick={handleScatterClick}
                        {...s}
                        data={s.data.map((point) => {
                            const isSelected = isDatapointSelected ? isDatapointSelected(point) : getCartesianPointSelected(point);

                            return {
                                size: isSelected ? LARGE_DOT_SIZE : SMALL_DOT_SIZE,
                                ...point
                            };
                        })}
                    />
                ))
            }
            {children}
        </ScatterGraph>
    );
};

SelectableScatterGraph.propTypes = {
    scatters: PropTypes.array.isRequired,
    onSelectedDataChange: PropTypes.func,
    isDatapointSelected: PropTypes.func,
    children: PropTypes.node
};

export default SelectableScatterGraph;
