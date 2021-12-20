import PropTypes from 'prop-types';
import metricsClient from 'clients/metrics';
import Async from 'components/async';

const CountEvents = ({sqlFilters}) => (
    <Async
        renderData={([d]) => d?.value}
        fetchData={() => metricsClient('queries/count-events', {sql_filters: sqlFilters})}
    />
);

CountEvents.propTypes = {
    sqlFilters: PropTypes.string
};

export default CountEvents;
