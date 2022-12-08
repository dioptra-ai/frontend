import PropTypes from 'prop-types';
import metricsClient from 'clients/metrics';
import Async from 'components/async';
import useAllFilters from 'hooks/use-all-filters';

const CountEvents = ({filters, ...rest}) => {
    filters = filters || useAllFilters();

    return (
        <Async
            renderData={([d]) => (
                <span>{d?.value !== undefined ? Number(d.value).toLocaleString() : d}</span>
            )}
            fetchData={() => metricsClient('throughput', {filters})}
            refetchOnChanged={[JSON.stringify(filters)]}
            defaultData={['-']}
            {...rest}
        />
    );
};

CountEvents.propTypes = {
    filters: PropTypes.array
};

export default CountEvents;
