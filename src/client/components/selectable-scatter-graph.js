import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';
import {Scatter} from 'recharts';
import oHash from 'object-hash';

import ScatterGraph from 'components/scatter-graph';

const LARGE_DOT_SIZE = 200;
const SMALL_DOT_SIZE = 60;

const inRange = (num, min, max) => num >= min && num <= max;

const SelectableScatterGraph = ({scatters, onSelectedDataChange, isDatapointSelected, children}) => {
    const [shiftPressed, setShiftPressed] = useState(false);
    const selectedPoints = scatters.map((scatter) => scatter.data.filter(isDatapointSelected)).flat();

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
        const deduplicatedPoints = points.filter((point, index, self) => self.findIndex((p) => p['sample']['uuid'] === point['sample']['uuid']) === index);

        onSelectedDataChange(deduplicatedPoints);
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
            onLegendClick={({payload}) => {
                if (shiftPressed) {
                    handlePointsSelected([...selectedPoints, ...payload['data']]);
                } else {
                    handlePointsSelected(payload['data']);
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
                        data={s.data.map((point) => ({
                            size: isDatapointSelected(point) ? LARGE_DOT_SIZE : SMALL_DOT_SIZE,
                            ...point
                        }))}
                    />
                ))
            }
            {children}
        </ScatterGraph>
    );
};

SelectableScatterGraph.propTypes = {
    scatters: PropTypes.array.isRequired,
    onSelectedDataChange: PropTypes.func.isRequired,
    isDatapointSelected: PropTypes.func.isRequired,
    children: PropTypes.node
};

export default SelectableScatterGraph;
