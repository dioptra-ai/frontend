import PropTypes from 'prop-types';
import {InView} from 'react-intersection-observer';
import Async from 'components/async';

import timeseriesClient from 'clients/timeseries';

const TimeseriesQuery = ({
    sql,
    children,
    renderData,
    defaultData,
    renderError,
    renderLoading,
    ...rest
}) => {
    const timeseriesClients = Array.isArray(sql) ?
        sql.map((qry) => {
            const {query, parameters} = qry;

            if (!query || !parameters) {
                throw new Error(
                    'The "sql" prop must be a return value of the sql`...` tagged template from: import {sql} from \'components/timeseries-query\';'
                );
            }

            return timeseriesClient({query, ...rest});
        }) :
        timeseriesClient({query: sql.query, ...rest});

    return (
        <Async
            refetchOnChanged={[timeseriesClients]}
            fetchData={
                timeseriesClients.length > 1 ? timeseriesClients : timeseriesClients
            }
            renderData={(data) => renderData(data?.length ? data : defaultData)}
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
    sql: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.shape({
            parameters: PropTypes.array.isRequired,
            query: PropTypes.string.isRequired
        }).isRequired
    ])
};

TimeseriesQuery.defaultProps = {
    renderError: String
};

export default TimeseriesQuery;

export const TimeseriesQueryInView = (props) => (
    <InView>
        {({inView, ref}) => inView ? (
            <div ref={ref}>
                <TimeseriesQuery {...props} />
            </div>
        ) : null
        }
    </InView>
);

export const sql = (strings, ...parameters) => {
    const query =
    parameters.map((p, i) => strings[i] + p).join('') + strings[strings.length - 1];

    return {
        query,
        parameters
    };
};
