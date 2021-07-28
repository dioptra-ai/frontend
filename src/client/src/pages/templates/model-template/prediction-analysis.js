import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {formatDateTime} from 'helpers/date-helper';
import BarGraph from 'components/bar-graph';
import AreaGraph from 'components/area-graph';
import TimeseriesQuery, {sql} from 'components/timeseries-query';
import {setupComponent} from 'helpers/component-helper';
import {getHexColor} from 'helpers/color-helper';
import {getName} from 'helpers/name-helper';

const PredictionAnalysis = ({timeStore, filtersStore}) => {
    const sqlTimeGranularity = timeStore.getTimeGranularity().toISOString();

    return (
        <Row className='my-5'>
            <Col className='d-flex' lg={4}>
                <TimeseriesQuery
                    defaultData={[]}
                    renderData={(data) => (
                        <BarGraph
                            bars={data.map(({prediction, Count}) => (
                                {name: getName(prediction), value: Count, fill: getHexColor(prediction)}
                            ))}
                            title='Online Class Distribution'
                            yAxisName='Count'
                        />
                    )}
                    sql={sql`
                        SELECT
                        prediction,
                        COUNT(*) AS "Count"
                        FROM "dioptra-gt-combined-eventstream"
                        WHERE ${timeStore.sqlTimeFilter} 
                        GROUP BY 1`
                    }
                />
            </Col>
            <Col className='d-flex' lg={4}>
                <TimeseriesQuery
                    defaultData={[]}
                    renderData={(data) => (
                        <BarGraph
                            bars={data.map(({prediction, Count}) => (
                                {name: getName(prediction), value: Count, fill: getHexColor(prediction)}
                            ))}
                            title='Offline Class Distribution'
                            yAxisName='Count'
                        />
                    )}
                    sql={sql`
                        SELECT
                        prediction,
                        COUNT(*) AS "Count"
                        FROM "dioptra-gt-combined-eventstream"
                        WHERE "__time" >= TIME_PARSE('2021-07-23T00:00:00.000Z') AND "__time" < TIME_PARSE('2021-07-24T00:00:00.000Z')
                        GROUP BY 1`
                    }
                />
            </Col>
            <Col className='d-flex' lg={4}>
                <TimeseriesQuery
                    defaultData={[]}
                    renderData={(data) => (
                        <AreaGraph
                            dots={data.map(({x, y}) => ({
                                y,
                                x: new Date(x).getTime()
                            }))}
                            graphType='monotone'
                            hasDot={false}
                            isTimeDependent
                            tickFormatter={(tick) => formatDateTime(tick).replace(' ', '\n')}
                            title='Offline / Online Distribution Distance'
                            xAxisDomain={timeStore.rangeMillisec}
                            xAxisName='Time'
                            yAxisName='Distance'
                        />
                    )}
                    sql={sql`WITH my_online_table as (
                              select my_table.my_time, cast(my_table.my_count as float) / cast(my_count_table.total_count as float) as my_percentage, 
                                CONCAT(my_table.feature_state, ' ') as my_field
                              from (
                                SELECT TIME_FLOOR(__time, '${sqlTimeGranularity}') as my_time, count(1) as my_count,
                                case when feature_state <> '' then feature_state else 'null' end as feature_state
                                FROM "dioptra-gt-combined-eventstream"
                                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                GROUP BY 1, 3
                              ) as my_table
                              join (
                                SELECT TIME_FLOOR(__time, '${sqlTimeGranularity}') as my_time, count(*) as total_count
                                FROM "dioptra-gt-combined-eventstream"
                                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                GROUP BY 1
                              ) as my_count_table
                              on my_table.my_time = my_count_table.my_time
                            ),

                            my_offline_table as (
                              select cast(my_table.my_count as float) / cast(my_count_table.total_count as float) as my_percentage, 
                                CONCAT(my_table.feature_state, ' ') as my_field
                              from (
                                SELECT count(1) as my_count,
                                case when feature_state <> '' then feature_state else 'null' end as feature_state,
                                1 as join_key
                                FROM "dioptra-gt-combined-eventstream"
                                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                GROUP BY 2
                              ) as my_table
                              join (
                                SELECT count(*) as total_count, 1 as join_key
                                FROM "dioptra-gt-combined-eventstream"
                                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                              ) as my_count_table
                              on my_table.join_key = my_count_table.join_key
                            )

                            select my_online_table.my_time as x, 
                                sqrt(sum(POWER(100 * my_online_table.my_percentage - 100 * my_offline_table.my_percentage, 2))) as y
                            from my_online_table
                            join my_offline_table
                            on my_offline_table.my_field = my_online_table.my_field
                            GROUP BY 1
                    `}
                />
            </Col>
        </Row>
    );
};

PredictionAnalysis.propTypes = {
    filtersStore: PropTypes.object,
    timeStore: PropTypes.object
};
export default setupComponent(PredictionAnalysis);
