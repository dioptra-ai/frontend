import {useMemo} from 'react';
import oHash from 'object-hash';

const useCartesianPoints = ({points, xLabel, yLabel}) => {
    const cartesianPoints = useMemo(() => {

        return points.reduce((agg, point) => {
            const x = point[xLabel];
            const y = point[yLabel];

            agg[x] = agg[x] || {};
            agg[x][y] = point;

            return agg;
        }, {});
    }, oHash(points));

    return (point) => cartesianPoints[point[xLabel]]?.[point[yLabel]];
};

export default useCartesianPoints;
