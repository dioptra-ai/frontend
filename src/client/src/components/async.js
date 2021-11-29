import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

export const AsyncContext = React.createContext();

const Async = ({
    children,
    renderData,
    renderError,
    renderLoading,
    fetchData,
    refetchOnChanged = [],
    defaultData
}) => {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        const fetchAllData = Array.isArray(fetchData) ?
            Promise.all(fetchData.map((f) => f())) : fetchData();

        fetchAllData.then((data) => {
            setError(null);
            setData(data);
        })
            .catch((error) => {
                setData(null);
                setError(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, refetchOnChanged);

    let content = null;

    if (children) {

        content = children({data, loading, error});
    } else if (loading && renderLoading) {

        content = renderLoading();
    } else if (error) {

        content = renderError(error, loading);
    } else {

        content = renderData(
            data ||
            defaultData ||
            (Array.isArray(fetchData) ? fetchData.map(() => []) : [])
        );
    }

    return (
        <AsyncContext.Provider value={{data, loading, error}}>
            {content}
        </AsyncContext.Provider>
    );
};

Async.propTypes = {
    children: PropTypes.func,
    renderData: PropTypes.func,
    renderError: PropTypes.func,
    renderLoading: PropTypes.func,
    fetchData: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.arrayOf(PropTypes.func)
    ]),
    refetchOnChanged: PropTypes.array,
    defaultData: PropTypes.object
};

Async.defaultProps = {
    renderError: (error, loading) => loading ? 'Loading...' : String(error)
};

export default Async;
