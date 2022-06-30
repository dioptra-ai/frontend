import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';

import ScatterChart from 'components/scatter-chart';

const LARGE_DOT_SIZE = 200;
const SMALL_DOT_SIZE = 60;

const inRange = (num, min, max) => num >= min && num <= max;

const SelectableScatterGraph = ({data, onSelectedDataChange, isDatapointSelected, getX, getY, getColor}) => {
    const [shiftPressed, setShiftPressed] = useState(false);
    const selectedPoints = data.filter(isDatapointSelected);
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
            const existingUUIDS = new Set(selectedPoints.map(({sample}) => sample['uuid']));

            // Toggle the point if it's already selected.
            if (existingUUIDS.has(point.sample['uuid'])) {
                newSelectedPoints = selectedPoints.filter(({sample}) => sample['uuid'] !== point.sample['uuid']);
            } else {
                newSelectedPoints = [...selectedPoints, point];
            }
        } else {
            newSelectedPoints = [point];
        }

        handlePointsSelected(newSelectedPoints);
    };
    const handlePointsSelected = (points) => {
        const pointsMap = points.reduce((acc, point) => {
            acc[point['sample']['uuid']] = point;

            return acc;
        }, {});

        onSelectedDataChange(Object.values(pointsMap));
    };

    return (
        <ScatterChart
            onAreaSelected={({left, right, top, bottom}) => {
                if (left && top && right && bottom) {
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
            onLegendClick={({payload}) => {
                if (shiftPressed) {
                    handlePointsSelected([...selectedPoints, ...payload['data']]);
                } else {
                    handlePointsSelected(payload['data']);
                }
            }}
            onScatterClick={handleScatterClick}
            data={data.map((point) => ({
                size: isDatapointSelected(point) ? LARGE_DOT_SIZE : SMALL_DOT_SIZE,
                ...point
            }))}
            getX={getX}
            getY={getY}
            getColor={getColor}
        />
    );
};

SelectableScatterGraph.propTypes = {
    data: PropTypes.array.isRequired,
    onSelectedDataChange: PropTypes.func.isRequired,
    isDatapointSelected: PropTypes.func.isRequired,
    getX: PropTypes.func.isRequired,
    getY: PropTypes.func.isRequired,
    getColor: PropTypes.func
};

export default SelectableScatterGraph;
