import BBoxLocationAnalysis from 'pages/common/bbox-location-analysis';

import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import metricsClient from 'clients/metrics';
import Async from 'components/async';

const UnsupervisedObjectDetection = () => {
    const allSqlFilters = useAllSqlFilters();

    return (
        <>
            <div className='my-3'>
                <Async
                    refetchOnChanged={[allSqlFilters]}
                    renderData={(data) => (
                        <BarGraph
                            bars={data.map(({prediction, my_percentage}) => ({
                                name: prediction,
                                value: my_percentage,
                                fill: getHexColor(prediction)
                            }))}
                            title='Online Class Distribution'
                            unit='%'
                        />
                    )}
                    fetchData={() => metricsClient('queries/class-distribution-2', {sql_filters: allSqlFilters})}
                />
            </div>
            <div className='my-3'>
                <BBoxLocationAnalysis/>
            </div>
        </>
    );
};

export default UnsupervisedObjectDetection;
