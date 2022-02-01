import PropTypes from 'prop-types';

import AreaGraph from 'components/area-graph';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import {setupComponent} from 'helpers/component-helper';

const Throughput = ({sqlFilters, timeStore}) => (

    <Async
        renderData={(data) => (
            <AreaGraph
                dots={data}
                xDataKey='time'
                yDataKey='value'
                title='Average Throughput (QPS)'
                xAxisName='Time'
            />
        )}
        fetchData={() => metricsClient('throughput', {
            sql_filters: sqlFilters,
            granularity_iso: timeStore
                .getTimeGranularity()
                .toISOString(),
            granularity_sec: timeStore
                .getTimeGranularity()
                .asSeconds()
        })}
        refetchOnChanged={[
            sqlFilters,
            timeStore.getTimeGranularity()
        ]}
    />
);

Throughput.propTypes = {
    sqlFilters: PropTypes.string.isRequired,
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(Throughput);
