import PropTypes from 'prop-types';
import metricsClient from 'clients/metrics';
import Async from 'components/async';

const CountEvents = ({sqlFilters}) => (
    <Async
        renderData={([d]) => Number(d?.value).toLocaleString()}
        fetchData={() => metricsClient('queries/count-events', {sql_filters: sqlFilters})}
        refetchOnChanged={[sqlFilters]}
    />
);

CountEvents.propTypes = {
    sqlFilters: PropTypes.string
};

export default CountEvents;
