import metricsClient from 'clients/metrics';
import Async from 'components/async';

const CountEvents = ({sqlFilters}) => (
    <Async
        defaultData={{}}
        renderData={({value}) => value}
        fetchData={() => metricsClient('query/count-events', {sql_filters: sqlFilters})}
    />
);

export default CountEvents;
