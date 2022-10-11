import BBoxLocationAnalysis from 'pages/common/bbox-location-analysis';

import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';
import useAllFilters from 'hooks/use-all-filters';
import metricsClient from 'clients/metrics';
import Async from 'components/async';

const UnsupervisedObjectDetection = () => {
    const allFilters = useAllFilters();

    return (
        <>
            <div className='my-3'>
                <Async
                    refetchOnChanged={[allFilters]}
                    renderData={(data) => (
                        <BarGraph
                            bars={data.map(({prediction, my_percentage}) => ({
                                name: prediction,
                                value: my_percentage,
                                fill: getHexColor(prediction)
                            }))}
                            title='Predicted Class Distribution'
                            unit='%'
                        />
                    )}
                    fetchData={() => metricsClient('queries/class-distribution', {
                        filters: allFilters,
                        distribution_field: 'prediction'
                    })}
                />
            </div>
            <div className='my-3'>
                <BBoxLocationAnalysis/>
            </div>
        </>
    );
};

export default UnsupervisedObjectDetection;
