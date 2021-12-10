import PropTypes from 'prop-types';
import Async from 'components/async';
import baseJSONClient from 'clients/base-json-client';

const fetchForQuery = (sqlQueryName, params) => {
    return () => baseJSONClient(`/api/metrics/query/${sqlQueryName}`, {
        method: 'post',
        body: params !== undefined ? params : {}
    });
};

const TimeseriesQuery = ({
    sqlQueryName,
    params,
    children,
    renderData,
    defaultData,
    renderError,
    renderLoading
}) => {
    let fetchTimeseries = null;

    if (Array.isArray(sqlQueryName)) {
        fetchTimeseries = sqlQueryName.map((qry, index) => {
            return fetchForQuery(qry, params[index]);
        });
    } else {
        fetchTimeseries = fetchForQuery(sqlQueryName, params);
    }

    return (
        <Async
            refetchOnChanged={[fetchTimeseries]}
            fetchData={fetchTimeseries}
            renderData={(data) => {
                if (data.length) {
                    if (Array.isArray(fetchTimeseries)) {
                        return renderData(
                            data?.map((d, index) => d.length ? d : defaultData[index])
                        );
                    } else {
                        return renderData(data);
                    }
                } else {
                    return renderData(defaultData);
                }
            }}
            renderError={renderError}
            renderLoading={renderLoading}
        >
            {children}
        </Async>
    );
};

TimeseriesQuery.propTypes = {
    children: PropTypes.func,
    defaultData: PropTypes.any.isRequired,
    renderData: PropTypes.func,
    renderError: PropTypes.func,
    renderLoading: PropTypes.func,
    sqlQueryName: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    params: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
};

TimeseriesQuery.defaultProps = {
    renderError: String
};

export default TimeseriesQuery;
