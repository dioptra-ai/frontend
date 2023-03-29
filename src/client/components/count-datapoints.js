import PropTypes from 'prop-types';
import Async from 'components/async';
import useAllFilters from 'hooks/use-all-filters';
import baseJSONClient from 'clients/base-json-client';

const CountDatapoints = ({filters, ...rest}) => {
    filters = filters || useAllFilters();

    return (
        <Async
            renderData={(d) => (
                <span>{!isNaN(d) ? Number(d).toLocaleString() : d}</span>
            )}
            fetchData={() => baseJSONClient.post('/api/datapoints/count', {filters})}
            refetchOnChanged={[JSON.stringify(filters)]}
            defaultData={'-'}
            {...rest}
        />
    );
};

CountDatapoints.propTypes = {
    filters: PropTypes.array
};

export default CountDatapoints;
