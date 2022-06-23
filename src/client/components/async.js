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
    defaultData,
    spinner = true
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
            {
                spinner ? (
                    <SpinnerWrapper>
                        {content}
                    </SpinnerWrapper>
                ) : content
            }
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
    defaultData: PropTypes.any,
    spinner: PropTypes.bool
};

Async.defaultProps = {
    renderError: (error) => <Error error={error}/>
};

export default Sentry.withErrorBoundary(Async, {
    fallback: ({error}) => <Error error={error}/> // eslint-disable-line react/prop-types
});
