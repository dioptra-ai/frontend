/* eslint-disable max-lines */
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import FilterInput from '../../../components/filter-input';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AreaGraph from '../../../components/area-graph';
import {formatDateTime} from '../../../helpers/date-helper';
import moment from 'moment';
import Select from '../../../components/select';
import FontIcon from '../../../components/font-icon';
import {IconNames} from '../../../constants';
import {Link} from 'react-router-dom';
import {Paths} from '../../../configs/route-config';
import {setupComponent} from '../../../helpers/component-helper';
import TimeseriesQuery, {sql} from 'components/timeseries-query';

const ModelPerformanceMetrics = {
    ACCURACY: {value: 'ACCURACY', name: 'Accuracy'},
    F1_SCORE: {value: 'F1_SCORE', name: 'F1 Score'},
    PRECISION: {value: 'PRECISION', name: 'Precision'},
    RECALL: {value: 'RECALL', name: 'Recall'}
};
const ModelPerformanceIndicators = {
    ADOPTION: {value: 'ADOPTION', name: 'Adoption'},
    CHURN: {value: 'CHURN', name: 'Churn'},
    CTR: {value: 'CTR', name: 'CTR'},
    CONVERSION: {value: 'CONVERSION', name: 'Conversion'}
};

const MetricInfoBox = ({value, notifications, warnings, name, sampleSize, unit}) => (
    <div className='border rounded p-3 w-100'>
        <div className='d-flex flex-wrap align-items-center'>
            <span className='text-dark-bold fw-bold'>{name}</span>
            <span className='text-primary mx-1'>(n={sampleSize || '-'})</span>
            {notifications && <FontIcon
                className='text-dark flex-grow-1'
                icon={IconNames.ALERTS_BELL}
                size={16}
            />}
            {warnings && <div className='d-flex align-items-center'>
                <FontIcon
                    className='text-warning'
                    icon={IconNames.WARNING}
                    size={16}/>
                <Link className='text-warning mx-1' style={{fontSize: '12px'}} to={Paths(1).MODEL_INCIDENTS_AND_ALERTS}>
                    View Incidents
                </Link>
            </div>}
        </div>
        <span className='text-dark' style={{fontSize: '60px'}}>{value ? value.toFixed(1) : '-'}{unit}</span>
    </div>
);

MetricInfoBox.propTypes = {
    name: PropTypes.string,
    notifications: PropTypes.number,
    sampleSize: PropTypes.any,
    unit: PropTypes.string,
    value: PropTypes.number,
    warnings: PropTypes.number
};

const PerformanceOverview = ({timeStore, filtersStore}) => {
    const [selectedMetric, setSelectedMetric] = useState(ModelPerformanceMetrics.ACCURACY.value);
    const [selectedIndicator, setSelectedIndicator] = useState(ModelPerformanceIndicators.ADOPTION.value);
    const sampleSizeComponent = (
        <TimeseriesQuery
            defaultData={[{sampleSize: 0}]}
            renderData={([{sampleSize}]) => sampleSize}
            sql={sql`
                SELECT COUNT(*) as sampleSize 
                FROM "dioptra-gt-combined-eventstream"
                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}`
            }
        />
    );
    const sqlTimeGranularity = timeStore.getTimeGranularity().toISOString();

    return (
        <>
            <FilterInput defaultFilters={filtersStore.filters} onChange={(filters) => filtersStore.filters = filters}/>
            <div className='my-5'>
                <h3 className='text-dark fw-bold fs-3 mb-3'>Service Performance</h3>
                <Row>
                    <Col lg={6}>
                        <TimeseriesQuery
                            defaultData={[]}
                            renderData={(data) => (
                                <AreaGraph
                                    dots={data.map(({throughput, __time}) => ({
                                        y: throughput,
                                        x: new Date(__time).getTime()
                                    }))}
                                    graphType='monotone'
                                    hasDot={false}
                                    isTimeDependent
                                    tickFormatter={(tick) => formatDateTime(moment(tick)).replace(' ', '\n')}
                                    title='Average Throughput (QPS)'
                                    xAxisDomain={timeStore.rangeMillisec}
                                    xAxisName='Time'
                                    yAxisName='Average Throughput (QPS)'
                                />
                            )}
                            sql={sql`
                                SELECT TIME_FLOOR(__time, '${timeStore.getTimeGranularity().toISOString()}') as "__time",
                                    COUNT(*) / ${timeStore.getTimeGranularity().asSeconds()} as throughput
                                FROM "dioptra-gt-combined-eventstream"
                                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                GROUP BY 1
                            `}
                        />
                    </Col>
                    <Col lg={6}>
                        <AreaGraph
                            dots={[]}
                            graphType='monotone'
                            hasDot={false}
                            isTimeDependent
                            tickFormatter={(tick) => formatDateTime(moment(tick)).replace(' ', '\n')}
                            title='Average Latency (ms)'
                            xAxisInterval={60}
                            xAxisName='Time'
                            yAxisDomain={[0, 25]}
                            yAxisName='Average Latency (ms)'
                        />
                    </Col>
                </Row>
            </div>
            <div className='my-5'>
                <h3 className='text-dark fw-bold fs-3 mb-3'>Model Performance</h3>
                <Row className='mb-3 align-items-stretch'>
                    <Col className='d-flex' lg={3}>
                        <TimeseriesQuery
                            defaultData={[{accuracy: NaN}]}
                            renderData={([{accuracy}]) => (
                                <MetricInfoBox
                                    name='Accuracy'
                                    sampleSize={sampleSizeComponent}
                                    unit='%'
                                    value={100 * accuracy}
                                />
                            )}
                            sql={sql`
                                SELECT CAST(sum(CASE WHEN prediction=groundtruth THEN 1 ELSE 0 END) AS DOUBLE) / sum(1) AS accuracy
                                FROM "dioptra-gt-combined-eventstream"
                                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}`
                            }
                        />
                    </Col>
                    <Col className='d-flex' lg={3}>
                        <TimeseriesQuery
                            defaultData={[{f1Score: NaN}]}
                            renderData={([{f1Score}]) => (
                                <MetricInfoBox
                                    name='F1 Score'
                                    sampleSize={sampleSizeComponent}
                                    unit='%'
                                    value={100 * f1Score}
                                />
                            )}
                            sql={sql`
                                    WITH true_positive as (
                                      SELECT
                                        groundtruth as label,
                                        sum(CASE WHEN prediction=groundtruth THEN 1 ELSE 0 END) as cnt_tp
                                      FROM "dioptra-gt-combined-eventstream"
                                      WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                      GROUP BY groundtruth
                                      ORDER by groundtruth
                                    ),
                                    true_sum as (
                                      SELECT
                                        prediction as label,
                                        count(1) as cnt_ts
                                      FROM "dioptra-gt-combined-eventstream"
                                      WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                      GROUP BY prediction
                                      ORDER by prediction
                                    ),
                                    pred_sum as (
                                      SELECT
                                        groundtruth as label,
                                        count(1) as cnt_ps
                                      FROM "dioptra-gt-combined-eventstream"
                                      WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                      GROUP BY groundtruth
                                      ORDER BY groundtruth
                                    )
                                    SELECT
                                      2 * ((my_table.my_precision * my_table.my_recall) / (my_table.my_precision + my_table.my_recall)) as f1Score
                                    FROM (
                                      SELECT
                                        AVG(cast(true_positive.cnt_tp as double) / true_sum.cnt_ts) as my_recall,
                                        AVG(cast(true_positive.cnt_tp as double) / pred_sum.cnt_ps) as my_precision
                                      FROM true_positive
                                      JOIN pred_sum ON pred_sum.label = true_positive.label
                                      JOIN true_sum ON true_sum.label = true_positive.label
                                    ) as my_table
                                `
                            }
                        />
                    </Col>
                    <Col className='d-flex' lg={3}>
                        <TimeseriesQuery
                            defaultData={[{recall: NaN}]}
                            renderData={([{recall}]) => (
                                <MetricInfoBox
                                    name='Recall'
                                    sampleSize={sampleSizeComponent}
                                    unit='%'
                                    value={100 * recall}
                                />
                            )}
                            sql={sql`
                                WITH true_positive as (
                                  SELECT
                                    groundtruth as label,
                                    sum(CASE WHEN prediction=groundtruth THEN 1 ELSE 0 END) as cnt_tp
                                  FROM
                                    "dioptra-gt-combined-eventstream"
                                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                  GROUP BY groundtruth
                                  order by groundtruth
                                ),
                                true_sum as (
                                  SELECT
                                    prediction as label,
                                    count(1) as cnt_ts
                                  FROM
                                    "dioptra-gt-combined-eventstream"
                                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                  GROUP BY prediction
                                  order by prediction
                                ),
                                pred_sum as (
                                  SELECT
                                    groundtruth as label,
                                    count(1) as cnt_ps
                                  FROM
                                    "dioptra-gt-combined-eventstream"
                                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                  GROUP BY groundtruth
                                  ORDER BY groundtruth
                                )

                                SELECT 
                                  AVG(cast(true_positive.cnt_tp as double) / true_sum.cnt_ts) as recall
                                FROM true_positive
                                JOIN true_sum
                                ON true_sum.label = true_positive.label
                            `
                            }
                        />
                    </Col>
                    <Col className='d-flex' lg={3}>
                        <TimeseriesQuery
                            defaultData={[{precision: NaN}]}
                            renderData={([{precision}]) => (
                                <MetricInfoBox
                                    name='Precision'
                                    sampleSize={sampleSizeComponent}
                                    unit='%'
                                    value={100 * precision}
                                />
                            )}
                            sql={sql`WITH true_positive as (
                              SELECT
                                groundtruth as label,
                                sum(CASE WHEN prediction=groundtruth THEN 1 ELSE 0 END) as cnt_tp
                              FROM
                                "dioptra-gt-combined-eventstream"
                              WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                              GROUP BY groundtruth
                              ORDER BY groundtruth
                            ),
                            true_sum as (
                              SELECT
                                prediction as label,
                                count(1) as cnt_ts
                              FROM
                                "dioptra-gt-combined-eventstream"
                              WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                              GROUP BY prediction
                              ORDER BY prediction
                            ),
                            pred_sum as (
                              SELECT
                                groundtruth as label,
                                count(1) as cnt_ps
                              FROM
                                "dioptra-gt-combined-eventstream"
                              WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                              GROUP BY groundtruth
                              ORDER BY groundtruth
                            )

                            SELECT 
                              AVG(cast(true_positive.cnt_tp as double) / pred_sum.cnt_ps) as "precision"
                            FROM true_positive
                            JOIN pred_sum
                            ON pred_sum.label = true_positive.label`}
                        />
                    </Col>
                </Row>
                <div className='border rounded p-3'>
                    <div className='d-flex justify-content-end my-3'>
                        <div style={{width: '200px'}}>
                            <Select
                                initialValue={selectedMetric}
                                onChange={setSelectedMetric}
                                options={Object.values(ModelPerformanceMetrics)}
                            />
                        </div>
                    </div>
                    <TimeseriesQuery
                        renderData={(metric) => (
                            <AreaGraph
                                dots={metric}
                                graphType='linear'
                                hasBorder={false}
                                isTimeDependent
                                margin = {{right: 0, bottom: 30}}
                                tickFormatter={(tick) => formatDateTime(moment(tick))}
                                unit='%'
                                xAxisInterval={60}
                                xAxisName='Time'
                                yAxisDomain={[0, 100]}
                                yAxisName={selectedMetric}
                            />
                        )}
                        sql={{
                            [ModelPerformanceMetrics.ACCURACY.value]: sql`
                                SELECT TIME_FLOOR(__time, '${sqlTimeGranularity}') as x,
                                  100 * CAST(sum(CASE WHEN prediction=groundtruth THEN 1 ELSE 0 END) AS DOUBLE) / CAST(sum(1) AS DOUBLE) AS y
                                FROM "dioptra-gt-combined-eventstream"
                                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                GROUP BY 1`,
                            [ModelPerformanceMetrics.PRECISION.value]: sql`
                                WITH true_positive as (
                                  SELECT
                                    TIME_FLOOR(__time, '${sqlTimeGranularity}') as "my_time",
                                    groundtruth as label,
                                    sum(CASE WHEN prediction=groundtruth THEN 1 ELSE 0 END) as cnt_tp
                                  FROM
                                    "dioptra-gt-combined-eventstream"
                                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                  GROUP BY 1, 2
                                  order by groundtruth
                                ),
                                true_sum as (
                                  SELECT
                                    TIME_FLOOR(__time, '${sqlTimeGranularity}') as "my_time",
                                    prediction as label,
                                    count(1) as cnt_ts
                                  FROM
                                    "dioptra-gt-combined-eventstream"
                                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                  GROUP BY 1, 2
                                  order by prediction
                                ),
                                pred_sum as (
                                  SELECT
                                    TIME_FLOOR(__time, '${sqlTimeGranularity}') as "my_time",
                                    groundtruth as label,
                                    count(1) as cnt_ps
                                  FROM
                                    "dioptra-gt-combined-eventstream"
                                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                  GROUP BY 1, 2
                                  ORDER BY groundtruth
                                )
                                SELECT
                                  true_positive.my_time as x,
                                  100 * AVG(cast(true_positive.cnt_tp as double) / pred_sum.cnt_ps) as y
                                FROM true_positive
                                JOIN pred_sum ON pred_sum.label = true_positive.label AND pred_sum.my_time = true_positive.my_time
                                GROUP BY 1
                            `,
                            [ModelPerformanceMetrics.RECALL.value]: sql`
                                WITH true_positive as (
                                  SELECT
                                    TIME_FLOOR(__time, '${sqlTimeGranularity}') as "my_time",
                                    groundtruth as label,
                                    sum(CASE WHEN prediction=groundtruth THEN 1 ELSE 0 END) as cnt_tp
                                  FROM
                                    "dioptra-gt-combined-eventstream"
                                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                  GROUP BY 1, 2
                                  order by groundtruth
                                ),
                                true_sum as (
                                  SELECT
                                    TIME_FLOOR(__time, '${sqlTimeGranularity}') as "my_time",
                                    prediction as label,
                                    count(1) as cnt_ts
                                  FROM
                                    "dioptra-gt-combined-eventstream"
                                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                  GROUP BY 1, 2
                                  order by prediction
                                ),
                                pred_sum as (
                                  SELECT
                                    TIME_FLOOR(__time, '${sqlTimeGranularity}') as "my_time",
                                    groundtruth as label,
                                    count(1) as cnt_ps
                                  FROM
                                    "dioptra-gt-combined-eventstream"
                                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                  GROUP BY 1, 2
                                  ORDER BY groundtruth
                                )

                                SELECT
                                  true_positive.my_time as x,
                                  100 * AVG(cast(true_positive.cnt_tp as double) / true_sum.cnt_ts) as y
                                FROM true_positive
                                JOIN true_sum ON true_sum.label = true_positive.label AND true_sum.my_time = true_positive.my_time
                                GROUP BY 1
                            `,
                            [ModelPerformanceMetrics.F1_SCORE.value]: sql`
                                WITH true_positive as (
                                  SELECT
                                    TIME_FLOOR(__time, '${sqlTimeGranularity}') as "my_time",
                                    groundtruth as label,
                                    sum(CASE WHEN prediction=groundtruth THEN 1 ELSE 0 END) as cnt_tp
                                  FROM
                                    "dioptra-gt-combined-eventstream"
                                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                  GROUP BY 1, 2
                                  order by groundtruth
                                ),
                                true_sum as (
                                  SELECT
                                    TIME_FLOOR(__time, '${sqlTimeGranularity}') as "my_time",
                                    prediction as label,
                                    count(1) as cnt_ts
                                  FROM
                                    "dioptra-gt-combined-eventstream"
                                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                  GROUP BY 1, 2
                                  order by prediction
                                ),
                                pred_sum as (
                                  SELECT
                                    TIME_FLOOR(__time, '${sqlTimeGranularity}') as "my_time",
                                    groundtruth as label,
                                    count(1) as cnt_ps
                                  FROM
                                    "dioptra-gt-combined-eventstream"
                                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                  GROUP BY 1, 2
                                  ORDER BY groundtruth
                                )

                                SELECT
                                  my_table.my_time as x, 
                                  100 * 2 * ((my_table.my_precision * my_table.my_recall) / (my_table.my_precision + my_table.my_recall)) as y
                                FROM (
                                  SELECT
                                    true_positive.my_time as my_time,
                                    AVG(cast(true_positive.cnt_tp as double) / true_sum.cnt_ts) as my_recall,
                                    AVG(cast(true_positive.cnt_tp as double) / pred_sum.cnt_ps) as my_precision
                                  FROM true_positive
                                  JOIN pred_sum ON pred_sum.label = true_positive.label AND pred_sum.my_time = true_positive.my_time
                                  JOIN true_sum ON true_sum.label = true_positive.label AND true_sum.my_time = true_positive.my_time
                                  GROUP BY 1
                                ) as my_table
                            `
                        }[selectedMetric]}
                    />
                </div>
            </div>
            <div className='my-5'>
                <h3 className='text-dark fw-bold fs-3 mb-3'>Key Performance Indicators</h3>
                <div className='border rounded p-3'>
                    <div className='d-flex justify-content-end my-3'>
                        <div style={{width: '200px'}}>
                            <Select
                                initialValue={selectedIndicator}
                                onChange={setSelectedIndicator}
                                options={Object.values(ModelPerformanceIndicators)}
                            />
                        </div>
                    </div>
                    <Row className='m-0'>
                        <Col
                            className='border rounded d-flex flex-column align-items-center justify-content-center my-3 p-3'
                            lg={4}
                            style={{height: '295px'}}
                        >
                            <p className='text-dark fw-bold'>Correlation to KPIs</p>
                            <span className='text-dark fw-bold fs-1'>37.6</span>
                        </Col>
                        <Col className='p-0 d-flex' lg={8}>
                            <AreaGraph
                                dots={[]}
                                graphType='linear'
                                hasBorder={false}
                                isTimeDependent
                                margin = {{right: 0, bottom: 30, left: 5}}
                                tickFormatter={(tick) => formatDateTime(moment(tick))}
                                xAxisInterval={60}
                                xAxisName='Time'
                                yAxisDomain={[0, 1000]}
                                yAxisName={getName(selectedIndicator)}
                            />
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
};

PerformanceOverview.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(PerformanceOverview);
