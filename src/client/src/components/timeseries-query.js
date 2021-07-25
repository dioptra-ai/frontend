import {useEffect, useState} from 'react';

import timeseriesClient from 'clients/timeseries';

const TimeseriesQuery = ({sql, children, renderData, renderError = String, renderLoading = () => 'Loading...', ...rest}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {query, parameters} = sql;

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
    }, parameters);

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

export default TimeseriesQuery;

export const sql = (strings, ...parameters) => {
    const query = parameters.map((p, i) => strings[i] + p).join('') + strings[strings.length - 1];

    return {
        query, parameters
    };
};
