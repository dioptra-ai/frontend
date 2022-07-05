import PropTypes from 'prop-types';
import metricsClient from 'clients/metrics';
import Async from 'components/async';

const CountEvents = ({sqlFilters, ...rest}) => (
    <Async
        renderData={([d]) => (
            <span>{Number(d?.value).toLocaleString()}</span>
        )}
        fetchData={() => metricsClient('queries/count-events', {sql_filters: sqlFilters})}
        refetchOnChanged={[sqlFilters]}
        {...rest}
    />
);

CountEvents.propTypes = {
    sqlFilters: PropTypes.string.isRequired
};

export default CountEvents;
