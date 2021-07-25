import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

import timeseriesClient from 'clients/timeseries';

const TimeseriesQuery = ({sql, children, renderData, renderNoData, renderError, renderLoading, ...rest}) => {
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

        if (data.length) {

            return renderData(data);
        } else {

            return renderNoData();
        }
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
    renderNoData: PropTypes.func,
    sql: PropTypes.shape({
        parameters: PropTypes.array.isRequired,
        query: PropTypes.string.isRequired
    }).isRequired
};

TimeseriesQuery.defaultProps = {
    renderError: String,
    renderLoading: () => 'Loading...',
    renderNoData: () => '<No Data>'
};

export default TimeseriesQuery;

export const sql = (strings, ...parameters) => {
    const query = parameters.map((p, i) => strings[i] + p).join('') + strings[strings.length - 1];

    return {
        query, parameters
    };
};
