import Async from 'components/async';
import BarGraph from 'components/bar-graph';
import metricsClient from 'clients/metrics';
import {getHexColor} from 'helpers/color-helper';
import useAllFilters from 'hooks/use-all-filters';

const GroundTruthDistribution = () => {
    const allFilters = useAllFilters();

    return (
        <Async
            refetchOnChanged={[allFilters]}
            renderData={(data) => (
                <BarGraph
                    bars={data.map((result) => ({
                        name: result.name,
                        value: result.value,
                        fill: getHexColor(result.name)
                    }))}
                    title='Groundtruth Distribution'
                    unit='%'
                />
            )}
            fetchData={() => metricsClient('queries/class-distribution', {
                filters: allFilters,
                distribution_field: 'groundtruth'
            })}
        />
    );
};

export default GroundTruthDistribution;
