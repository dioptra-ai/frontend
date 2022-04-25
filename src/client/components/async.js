import React, {useEffect, useState} from 'react';
import * as Sentry from '@sentry/react';
import PropTypes from 'prop-types';

import {SpinnerWrapper} from 'components/spinner';
import Error from 'components/error';

export const AsyncContext = React.createContext();

const Async = ({
    children,
    renderData,
    renderError,
    fetchData,
    refetchOnChanged = [],
    defaultData
}) => {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            setError(null);
            setLoading(true);

            try {
                const fetchAllData = Array.isArray(fetchData) ?
                    Promise.all(fetchData.map((f) => f())) :
                    fetchData();
                const data = await fetchAllData;

                setData(data);
            } catch (err) {
                setData(null);
                setError(err);

                Sentry.captureException(err);
            } finally {
                setLoading(false);
            }
        })();
    }, refetchOnChanged);

    let content = null;

    if (children) {

        content = children({data, loading, error});
    } else if (error) {

        content = renderError(error);
    } else if (data || defaultData) {

        content = renderData(data || defaultData);
    }

    return (
        <AsyncContext.Provider value={{data, loading, error}}>
            <SpinnerWrapper>
                {content}
            </SpinnerWrapper>
        </AsyncContext.Provider>
    );
};

Async.propTypes = {
    children: PropTypes.func,
    renderData: PropTypes.func,
    renderError: PropTypes.func,
    fetchData: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.arrayOf(PropTypes.func)
    ]),
    refetchOnChanged: PropTypes.array,
    defaultData: PropTypes.any
};

Async.defaultProps = {
    renderError: (error) => <Error error={error} variant='warning'/>
};

export default Sentry.withErrorBoundary(Async, {
    fallback: ({error}) => <Error error={error} variant='warning'/> // eslint-disable-line react/prop-types
});
