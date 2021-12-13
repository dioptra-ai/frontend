import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {SpinnerWrapper} from 'components/spinner';

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
    const [hasLoaded, setHasLoaded] = useState(false);

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
                setHasLoaded(true);
            });
    }, refetchOnChanged);

    let content = null;

    if (children) {

        content = children({data, loading, error});
    } else if (loading && renderLoading) {

        content = renderLoading();
    } else if (error) {

        content = renderError(error);
    } else if (data || defaultData) {

        content = renderData(data || defaultData);
    } else if (loading || !hasLoaded) {

        content = (
            <div style={{width: '100%', height: '100%'}}>
                <SpinnerWrapper/>
            </div>
        );
    } else return null;

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
    defaultData: PropTypes.any
};

Async.defaultProps = {
    renderError: String
};

export default Async;
