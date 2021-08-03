import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FilterInput from 'components/filter-input';
import {formatDateTime} from 'helpers/date-helper';
import BarGraph from 'components/bar-graph';
import AreaGraph from 'components/area-graph';
import TimeseriesQuery, {sql} from 'components/timeseries-query';
import {setupComponent} from 'helpers/component-helper';
import {getHexColor} from 'helpers/color-helper';
import {getName} from 'helpers/name-helper';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';

const PredictionAnalysis = ({timeStore, filtersStore}) => {
    const allSqlFilters = useAllSqlFilters();
    const sqlTimeGranularity = timeStore.getTimeGranularity().toISOString();

    return (
        <>
            <FilterInput defaultFilters={filtersStore.filters} onChange={(filters) => filtersStore.filters = filters}/>
            <div className='my-5'>
                <h3 className='text-dark bold-text fs-3 mb-3'>Prediction Analysis</h3>
                <Row className='my-5'>
                    <Col className='d-flex' lg={4}>
                        <TimeseriesQuery
                            defaultData={[]}
                            renderData={(data) => (
                                <BarGraph
                                    bars={data.map(({prediction, my_percentage}) => (
                                        {name: getName(prediction), value: my_percentage, fill: getHexColor(prediction)}
                                    ))}
                                    title='Online Class Distribution'
                                    yAxisName='%'
                                />
                            )}
                            sql={sql`
                                  SELECT
                                    cast(my_table.my_count as float) / cast(my_count_table.total_count as float) as my_percentage,
                                    my_table.prediction
                                  FROM (
                                    SELECT
                                        count(1) as my_count,
                                        prediction,
                                        1 as join_key
                                    FROM "dioptra-gt-combined-eventstream"
                                    WHERE
                                        ${allSqlFilters}
                                    GROUP BY 2
                                  ) AS my_table
                                  JOIN (
                                    SELECT
                                        count(*) as total_count,
                                        1 as join_key
                                    FROM "dioptra-gt-combined-eventstream"
                                    WHERE
                                        ${allSqlFilters}
                                  ) AS my_count_table
                                  ON my_table.join_key = my_count_table.join_key`
                            }
                        />
                    </Col>
                    <Col className='d-flex' lg={4}>
                        <TimeseriesQuery
                            defaultData={[]}
                            renderData={(data) => (
                                <BarGraph
                                    bars={data.map(({prediction, my_percentage}) => (
                                        {name: getName(prediction), value: my_percentage, fill: getHexColor(prediction)}
                                    ))}
                                    title='Offline Class Distribution'
                                    yAxisName='%'
                                />
                            )}
                            sql={sql`
                                  SELECT
                                    cast(my_table.my_count as float) / cast(my_count_table.total_count as float) as my_percentage,
                                    my_table.prediction
                                  FROM (
                                    SELECT
                                        count(1) as my_count,
                                        prediction,
                                        1 as join_key
                                    FROM "dioptra-gt-combined-eventstream"
                                    WHERE
                                        "__time" >= TIME_PARSE('2021-07-23T00:00:00.000Z') AND "__time" < TIME_PARSE('2021-07-24T00:00:00.000Z')
                                        AND ${filtersStore.sqlFilters}
                                    GROUP BY 2
                                  ) AS my_table
                                  JOIN (
                                    SELECT
                                        count(*) as total_count,
                                        1 as join_key
                                    FROM "dioptra-gt-combined-eventstream"
                                    WHERE
                                        "__time" >= TIME_PARSE('2021-07-23T00:00:00.000Z') AND "__time" < TIME_PARSE('2021-07-24T00:00:00.000Z')
                                        AND ${filtersStore.sqlFilters}
                                  ) AS my_count_table
                                  ON my_table.join_key = my_count_table.join_key`
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
                                      SELECT
                                        my_table.my_time,
                                        cast(my_table.my_count as float) / cast(my_count_table.total_count as float) as my_percentage,
                                        my_table.prediction
                                      FROM (
                                        SELECT
                                            TIME_FLOOR(__time, '${sqlTimeGranularity}') as my_time,
                                            count(1) as my_count,
                                            prediction
                                        FROM "dioptra-gt-combined-eventstream"
                                        WHERE ${allSqlFilters}
                                        GROUP BY 1, 3
                                      ) AS my_table
                                      JOIN (
                                        SELECT
                                            TIME_FLOOR(__time, '${sqlTimeGranularity}') as my_time,
                                            count(*) as total_count
                                        FROM "dioptra-gt-combined-eventstream"
                                        WHERE ${allSqlFilters}
                                        GROUP BY 1
                                      ) AS my_count_table
                                      ON my_table.my_time = my_count_table.my_time
                                    ),

                                    my_offline_table as (
                                      SELECT
                                        cast(my_table.my_count as float) / cast(my_count_table.total_count as float) as my_percentage,
                                        my_table.prediction
                                      FROM (
                                        SELECT
                                            count(1) as my_count,
                                            prediction,
                                            1 as join_key
                                        FROM "dioptra-gt-combined-eventstream"
                                        WHERE ${allSqlFilters}
                                        GROUP BY 2
                                      ) AS my_table
                                      JOIN (
                                        SELECT
                                            count(*) as total_count,
                                            1 as join_key
                                        FROM "dioptra-gt-combined-eventstream"
                                        WHERE ${allSqlFilters}
                                      ) AS my_count_table
                                      ON my_table.join_key = my_count_table.join_key
                                    )

                                    SELECT
                                        my_online_table.my_time as x,
                                        100 * sqrt(sum(POWER(my_online_table.my_percentage - my_offline_table.my_percentage, 2))) as y
                                    FROM my_online_table
                                    JOIN my_offline_table
                                    ON my_offline_table.prediction = my_online_table.prediction
                                    GROUP BY 1
                            `}
                        />
                    </Col>
                </Row>
            </div>
        </>
    );
};

PredictionAnalysis.propTypes = {
    filtersStore: PropTypes.object,
    timeStore: PropTypes.object
};
export default setupComponent(PredictionAnalysis);
