import Async from 'components/async';
import BarGraph from 'components/bar-graph';
import metricsClient from 'clients/metrics';
import {getHexColor} from 'helpers/color-helper';
import useModel from 'hooks/use-model';
import useAllSqlFilters from 'hooks/use-all-sql-filters';

const GroundTruthDistribution = () => {

    const allSqlFilters = useAllSqlFilters({
        __REMOVE_ME__excludeOrgId: true
    });
    const model = useModel();


    return (

        <Async
            refetchOnChanged={[allSqlFilters]}
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
            fetchData={() => metricsClient('gt-distribution', {
                sql_filters: allSqlFilters,
                model_type: model.mlModelType
            })}
        />
    );
};

export default GroundTruthDistribution;
