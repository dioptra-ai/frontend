import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

import timeseriesClient from 'clients/timeseries';

const TimeseriesQuery = ({sql, children, renderData, renderError = String, renderLoading = () => 'Loading...', ...rest}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {query, parameters} = sql;

    if (!query || !parameters) {
        throw new Error('The "sql" prop must be a return value of the sql`...` tagged template from: import {sql} from \'components/timeseries-query\';');
    }

    useEffect(() => {

        setLoading(true);

        timeseriesClient({query, ...rest})
            .then((data) => {
                setError(null);
                setData(data);
            })
            .catch((error) => {
                setError(error);
                setData(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [query, ...parameters]);

    if (children) {

        return children({data, loading, error});
    } else if (data) {

        return renderData(data);
    } else if (loading) {

        return renderLoading();
    } else if (error) {

        return renderError(error);
    } else return null;
};

TimeseriesQuery.propTypes = {
    children: PropTypes.func,
    renderData: PropTypes.func,
    renderError: PropTypes.func,
    renderLoading: PropTypes.func,
    sql: PropTypes.shape({
        parameters: PropTypes.array.isRequired,
        query: PropTypes.string.isRequired
    }).isRequired
};

export default TimeseriesQuery;

export const sql = (strings, ...parameters) => {
    const query = parameters.map((p, i) => strings[i] + p).join('') + strings[strings.length - 1];

    return {
        query, parameters
    };
};
