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
    let timeseriesClients = null;

    if (Array.isArray(sql)) {
        timeseriesClients = sql.map((qry) => {
            const {query, parameters} = qry;

            if (!query || !parameters) {
                throw new Error(
                    'The "sql" prop must be a return value of the sql`...` tagged template from: import {sql} from \'components/timeseries-query\';'
                );
            }

            return timeseriesClient({query, ...rest});
        });
    } else {
        const {query, parameters} = sql;

        if (!query || !parameters) {
            throw new Error(
                'The "sql" prop must be a return value of the sql`...` tagged template from: import {sql} from \'components/timeseries-query\';'
            );
        }

        timeseriesClients = timeseriesClient({query: sql.query, ...rest});
    }

    const decideOnData = (data) => {
        if (data.length) {
            if (Array.isArray(timeseriesClients)) {
                return data?.map((d, index) => (d.length ? d : defaultData[index]));
            }
        }

        return defaultData;
    };

    return (
        <Async
            refetchOnChanged={[timeseriesClients]}
            fetchData={timeseriesClients}
            renderData={(data) => renderData(decideOnData(data))}
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
