import PropTypes from 'prop-types';
import metricsClient from 'clients/metrics';
import Async from 'components/async';

const CountEvents = ({sqlFilters}) => (
    <Async
        defaultData={{}}
        renderData={([d]) => d?.value}
        fetchData={() => metricsClient('query/count-events', {sql_filters: sqlFilters})}
    />
);

CountEvents.propTypes = {
    sqlFilters: PropTypes.string
};

export default CountEvents;
