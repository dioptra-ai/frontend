import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

const Async = ({
    children,
    renderData,
    renderError,
    renderLoading,
    fetchData,
    refetchOnChanged = []
}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        const fetchAllData = Array.isArray(fetchData) ?
            Promise.all(fetchData) :
            fetchData;

        (typeof fetchAllData === 'function' ? fetchAllData() : fetchAllData)
            .then((data) => {
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

    if (children) {
        return children({data, loading, error});
    } else if (loading && renderLoading) {
        return renderLoading();
    } else if (error) {
        return renderError(error);
    } else if (data) {
        return renderData(data);
    } else {
        return null;
    }
};

Async.propTypes = {
    children: PropTypes.func,
    renderData: PropTypes.func,
    renderError: PropTypes.func,
    renderLoading: PropTypes.func,
    fetchData: PropTypes.func,
    refetchOnChanged: PropTypes.array
};

Async.defaultProps = {
    renderError: String
};

export default Async;
