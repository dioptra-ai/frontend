import PropTypes from 'prop-types';
import metricsClient from 'clients/metrics';
import Async from 'components/async';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

const CountEvents = ({sqlFilters}) => (
    <Async
        renderData={([d]) => (
            <OverlayTrigger overlay={(
                <Tooltip>Number of datapoints</Tooltip>
            )}>
                <span>{Number(d?.value).toLocaleString()}</span>
            </OverlayTrigger>
        )}
        fetchData={() => metricsClient('queries/count-events', {sql_filters: sqlFilters})}
        refetchOnChanged={[sqlFilters]}
    />
);

CountEvents.propTypes = {
    sqlFilters: PropTypes.string
};

export default CountEvents;
