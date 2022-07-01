import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';

import ScatterChart from 'components/scatter-chart';

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

        if (point) {
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
                const filteredData = data.filter(
                    ({PCA1, PCA2}) => inRange(PCA1, left, right) && inRange(PCA2, top, bottom)
                );

                if (shiftPressed) {
                    handlePointsSelected([...selectedPoints, ...filteredData]);
                } else {
                    handlePointsSelected([...filteredData]);
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
                selected: isDatapointSelected(point),
                ...point
            }))}
            getX={getX}
            getY={getY}
            getColor={getColor}
            isProminent={(p) => p.selected}
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
