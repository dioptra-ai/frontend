/* eslint-disable max-lines */
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FilterInput from 'components/filter-input';
import AreaGraph from 'components/area-graph';
import Select from 'components/select';
import {setupComponent} from 'helpers/component-helper';
import TimeseriesQuery, {sql} from 'components/timeseries-query';
import {getName} from 'helpers/name-helper';
import MetricInfoBox from 'components/metric-info-box';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import Async from 'components/async';
import baseJSONClient from 'clients/base-json-client';
import useModel from 'customHooks/use-model';
import Async from 'components/async';
import baseJSONClient from 'clients/base-json-client';

const ModelPerformanceMetrics = {
    ACCURACY: {value: 'ACCURACY', name: 'Accuracy'},
    F1_SCORE: {value: 'F1_SCORE', name: 'F1 Score'},
    PRECISION: {value: 'PRECISION', name: 'Precision'},
    RECALL: {value: 'RECALL', name: 'Recall'}
};

const PerformanceOverview = ({timeStore, filtersStore}) => {
    const [selectedMetric, setSelectedMetric] = useState(
        ModelPerformanceMetrics.ACCURACY.value
    );
    const [modelPerformanceIndicators, setModelPerformanceIndicators] = useState([]);
    const [selectedIndicator, setSelectedIndicator] = useState(null);
    const allSqlFilters = useAllSqlFilters();
    const allSqlFiltersWithoutOrgId = useAllSqlFilters({
        __REMOVE_ME__excludeOrgId: true
    });
    const sqlFiltersWithModelTime = useAllSqlFilters({useReferenceRange: true});
    const model = useModel();

    useEffect(() => {
        baseJSONClient('/api/metrics/integrations/redash').then(({queries = []}) => {
            if (queries.length) {
                setSelectedIndicator(String(queries[0].id));
            }
            setModelPerformanceIndicators(
                queries.map(({id, name}) => ({
                    value: String(id),
                    name
                }))
            );
        });
    }, []);

    const sampleSizeComponent = (
        <TimeseriesQuery
            defaultData={[{sampleSize: 0}]}
            renderData={([{sampleSize}]) => sampleSize}
            sql={sql`
                SELECT COUNT(*) as sampleSize 
                FROM "dioptra-gt-combined-eventstream"
                WHERE ${allSqlFilters}`}
        />
    );
    const timeGranularityValue = timeStore.getTimeGranularity();
    const timeGranularity = timeGranularityValue.toISOString();
    const predictionName =
        model.mlModelType === 'DOCUMENT_PROCESSING' ?
            '"prediction.class_name"' :
            '"prediction"';
    const groundTruthName =
        model.mlModelType === 'DOCUMENT_PROCESSING' ?
            '"groundtruth.class_name"' :
            '"groundtruth"';

    const getSelectedQuery = () => {
        return {
            [ModelPerformanceMetrics.ACCURACY.value]: sql`
        SELECT TIME_FLOOR(__time, '${timeGranularity}') as x,
          100 * CAST(sum(CASE WHEN ${predictionName}=${groundTruthName} THEN 1 ELSE 0 END) AS DOUBLE) / CAST(sum(1) AS DOUBLE) AS y
        FROM "dioptra-gt-combined-eventstream"
        WHERE ${allSqlFilters}
        GROUP BY 1`,
            [ModelPerformanceMetrics.PRECISION.value]: sql`
        WITH true_positive as (
          SELECT
            TIME_FLOOR(__time, '${timeGranularity}') as "my_time",
            ${groundTruthName} as label,
            sum(CASE WHEN ${predictionName}=${groundTruthName} THEN 1 ELSE 0 END) as cnt_tp
          FROM
            "dioptra-gt-combined-eventstream"
          WHERE ${allSqlFilters}
          GROUP BY 1, 2
          order by ${groundTruthName}
        ),
        true_sum as (
          SELECT
            TIME_FLOOR(__time, '${timeGranularity}') as "my_time",
            ${predictionName} as label,
            count(1) as cnt_ts
          FROM
            "dioptra-gt-combined-eventstream"
          WHERE ${allSqlFilters}
          GROUP BY 1, 2
          order by ${predictionName}
        ),
        pred_sum as (
          SELECT
            TIME_FLOOR(__time, '${timeGranularity}') as "my_time",
            ${groundTruthName} as label,
            count(1) as cnt_ps
          FROM
            "dioptra-gt-combined-eventstream"
          WHERE ${allSqlFilters}
          GROUP BY 1, 2
          ORDER BY ${groundTruthName}
        )
        SELECT
          true_positive.my_time as x,
          100 * AVG(cast(true_positive.cnt_tp as double) / pred_sum.cnt_ps) as y
        FROM true_positive
          JOIN pred_sum ON pred_sum.label = true_positive.label AND pred_sum.my_time = true_positive.my_time
          JOIN true_sum ON true_sum.label = true_positive.label AND true_sum.my_time = true_positive.my_time
        GROUP BY 1
    `,
            [ModelPerformanceMetrics.RECALL.value]: sql`
        WITH true_positive as (
          SELECT
            TIME_FLOOR(__time, '${timeGranularity}') as "my_time",
            ${groundTruthName} as label,
            sum(CASE WHEN ${predictionName}=${groundTruthName} THEN 1 ELSE 0 END) as cnt_tp
          FROM
            "dioptra-gt-combined-eventstream"
          WHERE ${allSqlFilters}
          GROUP BY 1, 2
          order by ${groundTruthName}
        ),
        true_sum as (
          SELECT
            TIME_FLOOR(__time, '${timeGranularity}') as "my_time",
            ${predictionName} as label,
            count(1) as cnt_ts
          FROM
            "dioptra-gt-combined-eventstream"
          WHERE ${allSqlFilters}
          GROUP BY 1, 2
          order by ${predictionName}
        ),
        pred_sum as (
          SELECT
            TIME_FLOOR(__time, '${timeGranularity}') as "my_time",
            ${groundTruthName} as label,
            count(1) as cnt_ps
          FROM
            "dioptra-gt-combined-eventstream"
          WHERE ${allSqlFilters}
          GROUP BY 1, 2
          ORDER BY ${groundTruthName}
        )

        SELECT
          true_positive.my_time as x,
          100 * AVG(cast(true_positive.cnt_tp as double) / true_sum.cnt_ts) as y
        FROM true_positive
          JOIN pred_sum ON pred_sum.label = true_positive.label AND pred_sum.my_time = true_positive.my_time
          JOIN true_sum ON true_sum.label = true_positive.label AND true_sum.my_time = true_positive.my_time
        GROUP BY 1
    `,
            [ModelPerformanceMetrics.F1_SCORE.value]: sql`
        WITH true_positive as (
          SELECT
            TIME_FLOOR(__time, '${timeGranularity}') as "my_time",
            ${groundTruthName} as label,
            sum(CASE WHEN ${predictionName}=${groundTruthName} THEN 1 ELSE 0 END) as cnt_tp
          FROM
            "dioptra-gt-combined-eventstream"
          WHERE ${allSqlFilters}
          GROUP BY 1, 2
          order by ${groundTruthName}
        ),
        true_sum as (
          SELECT
            TIME_FLOOR(__time, '${timeGranularity}') as "my_time",
            ${predictionName} as label,
            count(1) as cnt_ts
          FROM
            "dioptra-gt-combined-eventstream"
          WHERE ${allSqlFilters}
          GROUP BY 1, 2
          order by ${predictionName}
        ),
        pred_sum as (
          SELECT
            TIME_FLOOR(__time, '${timeGranularity}') as "my_time",
            ${groundTruthName} as label,
            count(1) as cnt_ps
          FROM
            "dioptra-gt-combined-eventstream"
          WHERE ${allSqlFilters}
          GROUP BY 1, 2
          ORDER BY ${groundTruthName}
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
        }[selectedMetric];
    };

    return (
        <>
            <FilterInput
                defaultFilters={filtersStore.filters}
                onChange={(filters) => (filtersStore.filters = filters)}
            />
            <div className='my-5'>
                <h3 className='text-dark bold-text fs-3 mb-3'>
                    Service Performance
                </h3>
                <Row>
                    <Col>
                        <TimeseriesQuery
                            defaultData={[]}
                            renderData={(data) => (
                                <AreaGraph
                                    dots={data.map(({throughput, __time}) => ({
                                        y: throughput,
                                        x: new Date(__time).getTime()
                                    }))}
                                    isTimeDependent
                                    title='Average Throughput (QPS)'
                                    xAxisName='Time'
                                    yAxisName='Average Throughput (QPS)'
                                />
                            )}
                            sql={sql`
                                SELECT TIME_FLOOR(__time, '${timeStore
            .getTimeGranularity()
            .toISOString()}') as "__time",
                                    COUNT(*) / ${timeStore
            .getTimeGranularity()
            .asSeconds()} as throughput
                                FROM "dioptra-gt-combined-eventstream"
                                WHERE ${allSqlFilters}
                                GROUP BY 1
                            `}
                        />
                    </Col>
                </Row>
            </div>
            <div className='my-5'>
                <h3 className='text-dark bold-text fs-3 mb-3'>Model Performance</h3>
                {
                    model.mlModelType === 'Q_N_A' ? (
                        <Row className='mb-3 align-items-stretch'>
                            <Col className='d-flex' lg={3}>
                                <Async
                                    fetchData={() => baseJSONClient('/api/metrics/exact-match', {
                                        method: 'post',
                                        body: {
                                            sql_filters: allSqlFiltersWithoutOrgId
                                        }
                                    })}
                                    refetchOnChanged={[allSqlFiltersWithoutOrgId]}
                                    renderData={([{exact_match} = {}]) => (
                                        <MetricInfoBox
                                            name='EM'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={100 * exact_match}
                                        />
                                    )}
                                />
                            </Col>
                            <Col className='d-flex' lg={3}>
                                <Async
                                    fetchData={() => baseJSONClient('/api/metrics/f1-score', {
                                        method: 'post',
                                        body: {
                                            sql_filters: allSqlFiltersWithoutOrgId
                                        }
                                    })}
                                    refetchOnChanged={[allSqlFiltersWithoutOrgId]}
                                    renderData={([{f1_score} = {}]) => (
                                        <MetricInfoBox
                                            name='F1 Score'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={100 * f1_score}
                                        />
                                    )}
                                />
                            </Col>
                        </Row>
                    ) : (
                        <Row className='mb-3 align-items-stretch'>
                            <Col className='d-flex' lg={3}>
                                <TimeseriesQuery
                                    defaultData={[[{accuracy: 0}], [{accuracy: 0}]]}
                                    renderData={([[{accuracy}], [data]]) => (
                                        <MetricInfoBox
                                            name='Accuracy'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={accuracy}
                                            difference={accuracy - data?.accuracy}
                                        />
                                    )}
                                    sql={[
                                        sql`
                                        SELECT 100 * CAST(sum(CASE WHEN ${predictionName}=${groundTruthName} THEN 1 ELSE 0 END) AS DOUBLE) / sum(1) AS accuracy
                                        FROM "dioptra-gt-combined-eventstream"
                                        WHERE ${allSqlFilters}`,
                                        sql`
                                        SELECT 100 * CAST(sum(CASE WHEN ${predictionName}=${groundTruthName} THEN 1 ELSE 0 END) AS DOUBLE) / sum(1) AS accuracy
                                        FROM "dioptra-gt-combined-eventstream"
                                        WHERE ${sqlFiltersWithModelTime}`
                                    ]}
                                />
                            </Col>
                            <Col className='d-flex' lg={3}>
                                <TimeseriesQuery
                                    defaultData={[[{f1Score: 0}], [{f1Score: 0}]]}
                                    renderData={([[{f1Score}], [data]]) => (
                                        <MetricInfoBox
                                            name='F1 Score'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={100 * f1Score}
                                            difference={100 * (f1Score - data?.f1Score)}
                                        />
                                    )}
                                    sql={[
                                        sql`
                                            WITH true_positive as (
                                              SELECT
                                                ${groundTruthName} as label,
                                                sum(CASE WHEN ${predictionName}=${groundTruthName} THEN 1 ELSE 0 END) as cnt_tp
                                              FROM "dioptra-gt-combined-eventstream"
                                              WHERE ${allSqlFilters}
                                              GROUP BY ${groundTruthName}
                                              ORDER by ${groundTruthName}
                                            ),
                                            true_sum as (
                                              SELECT
                                                ${predictionName} as label,
                                                count(1) as cnt_ts
                                              FROM "dioptra-gt-combined-eventstream"
                                              WHERE ${allSqlFilters}
                                              GROUP BY ${predictionName}
                                              ORDER by ${predictionName}
                                            ),
                                            pred_sum as (
                                              SELECT
                                                ${groundTruthName} as label,
                                                count(1) as cnt_ps
                                              FROM "dioptra-gt-combined-eventstream"
                                              WHERE ${allSqlFilters}
                                              GROUP BY ${groundTruthName}
                                              ORDER BY ${groundTruthName}
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
                                        `,
                                        sql`
                                        WITH true_positive as (
                                          SELECT
                                            ${groundTruthName} as label,
                                            sum(CASE WHEN ${predictionName}=${groundTruthName} THEN 1 ELSE 0 END) as cnt_tp
                                          FROM "dioptra-gt-combined-eventstream"
                                          WHERE ${sqlFiltersWithModelTime}
                                          GROUP BY ${groundTruthName}
                                          ORDER by ${groundTruthName}
                                        ),
                                        true_sum as (
                                          SELECT
                                            ${predictionName} as label,
                                            count(1) as cnt_ts
                                          FROM "dioptra-gt-combined-eventstream"
                                          WHERE ${sqlFiltersWithModelTime}
                                          GROUP BY ${predictionName}
                                          ORDER by ${predictionName}
                                        ),
                                        pred_sum as (
                                          SELECT
                                            ${groundTruthName} as label,
                                            count(1) as cnt_ps
                                          FROM "dioptra-gt-combined-eventstream"
                                          WHERE ${sqlFiltersWithModelTime}
                                          GROUP BY ${groundTruthName}
                                          ORDER BY ${groundTruthName}
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
                                    ]}
                                />
                            </Col>
                            <Col className='d-flex' lg={3}>
                                <TimeseriesQuery
                                    defaultData={[[{recall: 0}], [{recall: 0}]]}
                                    renderData={([[{recall}], [data]]) => (
                                        <MetricInfoBox
                                            name='Recall'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={100 * recall}
                                            difference={100 * (recall - data?.recall)}
                                        />
                                    )}
                                    sql={[
                                        sql`
                                        WITH true_positive as (
                                          SELECT
                                            ${groundTruthName} as label,
                                            sum(CASE WHEN ${predictionName}=${groundTruthName} THEN 1 ELSE 0 END) as cnt_tp
                                          FROM
                                            "dioptra-gt-combined-eventstream"
                                          WHERE ${allSqlFilters}
                                          GROUP BY ${groundTruthName}
                                          order by ${groundTruthName}
                                        ),
                                        true_sum as (
                                          SELECT
                                            ${predictionName} as label,
                                            count(1) as cnt_ts
                                          FROM
                                            "dioptra-gt-combined-eventstream"
                                          WHERE ${allSqlFilters}
                                          GROUP BY ${predictionName}
                                          order by ${predictionName}
                                        ),
                                        pred_sum as (
                                          SELECT
                                            ${groundTruthName} as label,
                                            count(1) as cnt_ps
                                          FROM
                                            "dioptra-gt-combined-eventstream"
                                          WHERE ${allSqlFilters}
                                          GROUP BY ${groundTruthName}
                                          ORDER BY ${groundTruthName}
                                        )

                                        SELECT 
                                          AVG(cast(true_positive.cnt_tp as double) / true_sum.cnt_ts) as recall
                                        FROM true_positive
                                          JOIN pred_sum ON pred_sum.label = true_positive.label
                                          JOIN true_sum ON true_sum.label = true_positive.label
                                    `,
                                        sql`
                                    WITH true_positive as (
                                      SELECT
                                        ${groundTruthName} as label,
                                        sum(CASE WHEN ${predictionName}=${groundTruthName} THEN 1 ELSE 0 END) as cnt_tp
                                      FROM
                                        "dioptra-gt-combined-eventstream"
                                      WHERE ${sqlFiltersWithModelTime}
                                      GROUP BY ${groundTruthName}
                                      order by ${groundTruthName}
                                    ),
                                    true_sum as (
                                      SELECT
                                        ${predictionName} as label,
                                        count(1) as cnt_ts
                                      FROM
                                        "dioptra-gt-combined-eventstream"
                                      WHERE ${sqlFiltersWithModelTime}
                                      GROUP BY ${predictionName}
                                      order by ${predictionName}
                                    ),
                                    pred_sum as (
                                      SELECT
                                        ${groundTruthName} as label,
                                        count(1) as cnt_ps
                                      FROM
                                        "dioptra-gt-combined-eventstream"
                                      WHERE ${sqlFiltersWithModelTime}
                                      GROUP BY ${groundTruthName}
                                      ORDER BY ${groundTruthName}
                                    )

                                    SELECT 
                                      AVG(cast(true_positive.cnt_tp as double) / true_sum.cnt_ts) as recall
                                    FROM true_positive
                                      JOIN pred_sum ON pred_sum.label = true_positive.label
                                      JOIN true_sum ON true_sum.label = true_positive.label
                                `
                                    ]}
                                />
                            </Col>
                            <Col className='d-flex' lg={3}>
                                <TimeseriesQuery
                                    defaultData={[[{precision: 0}], [{precision: 0}]]}
                                    renderData={([[{precision}], [data]]) => (
                                        <MetricInfoBox
                                            name='Precision'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={100 * precision}
                                            difference={
                                                100 * (precision - data?.precision)
                                            }
                                        />
                                    )}
                                    sql={[
                                        sql`WITH true_positive as (
                                      SELECT
                                        ${groundTruthName} as label,
                                        sum(CASE WHEN ${predictionName}=${groundTruthName} THEN 1 ELSE 0 END) as cnt_tp
                                      FROM
                                        "dioptra-gt-combined-eventstream"
                                      WHERE ${allSqlFilters}
                                      GROUP BY ${groundTruthName}
                                      ORDER BY ${groundTruthName}
                                    ),
                                    true_sum as (
                                      SELECT
                                        ${predictionName} as label,
                                        count(1) as cnt_ts
                                      FROM
                                        "dioptra-gt-combined-eventstream"
                                      WHERE ${allSqlFilters}
                                      GROUP BY ${predictionName}
                                      ORDER BY ${predictionName}
                                    ),
                                    pred_sum as (
                                      SELECT
                                        ${groundTruthName} as label,
                                        count(1) as cnt_ps
                                      FROM
                                        "dioptra-gt-combined-eventstream"
                                      WHERE ${allSqlFilters}
                                      GROUP BY ${groundTruthName}
                                      ORDER BY ${groundTruthName}
                                    )

                                    SELECT 
                                      AVG(cast(true_positive.cnt_tp as double) / pred_sum.cnt_ps) as "precision"
                                    FROM true_positive
                                      JOIN pred_sum ON pred_sum.label = true_positive.label
                                      JOIN true_sum ON true_sum.label = true_positive.label
                                    `,
                                        sql`WITH true_positive as (
                                      SELECT
                                        ${groundTruthName} as label,
                                        sum(CASE WHEN ${predictionName}=${groundTruthName} THEN 1 ELSE 0 END) as cnt_tp
                                      FROM
                                        "dioptra-gt-combined-eventstream"
                                      WHERE ${sqlFiltersWithModelTime}
                                      GROUP BY ${groundTruthName}
                                      ORDER BY ${groundTruthName}
                                    ),
                                    true_sum as (
                                      SELECT
                                        ${predictionName} as label,
                                        count(1) as cnt_ts
                                      FROM
                                        "dioptra-gt-combined-eventstream"
                                      WHERE ${sqlFiltersWithModelTime}
                                      GROUP BY ${predictionName}
                                      ORDER BY ${predictionName}
                                    ),
                                    pred_sum as (
                                      SELECT
                                        ${groundTruthName} as label,
                                        count(1) as cnt_ps
                                      FROM
                                        "dioptra-gt-combined-eventstream"
                                      WHERE ${sqlFiltersWithModelTime}
                                      GROUP BY ${groundTruthName}
                                      ORDER BY ${groundTruthName}
                                    )

                                    SELECT 
                                      AVG(cast(true_positive.cnt_tp as double) / pred_sum.cnt_ps) as "precision"
                                    FROM true_positive
                                      JOIN pred_sum ON pred_sum.label = true_positive.label
                                      JOIN true_sum ON true_sum.label = true_positive.label
                                    `
                                    ]}
                                />
                            </Col>
                        </Row>
                    )}
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
                        defaultData={[]}
                        renderData={(metric) => (
                            <AreaGraph
                                dots={metric}
                                hasBorder={false}
                                isTimeDependent
                                margin={{right: 0, bottom: 30}}
                                unit='%'
                                xAxisName='Time'
                                yAxisDomain={[0, 100]}
                                yAxisName={getName(selectedMetric)}
                            />
                        )}
                        sql={getSelectedQuery()}
                    />
                </div>
            </div>
            <div className='my-5'>
                <h3 className='text-dark bold-text fs-3 mb-3'>
                    Key Performance Indicators
                </h3>
                <div className='border rounded p-3'>
                    <div className='d-flex justify-content-end my-3'>
                        <div style={{width: '200px'}}>
                            {modelPerformanceIndicators.length ? (
                                <Select
                                    initialValue={
                                        selectedIndicator ||
                                        String(modelPerformanceIndicators[0].value)
                                    }
                                    onChange={setSelectedIndicator}
                                    options={modelPerformanceIndicators}
                                />
                            ) : null}
                        </div>
                    </div>
                    <Row className='m-0'>
                        <Col
                            className='border rounded d-flex flex-column align-items-center justify-content-center my-3 p-3'
                            lg={4}
                            style={{height: '295px'}}
                        >
                            <p className='text-dark bold-text fs-6'>
                                Correlation to KPIs
                            </p>
                            {selectedIndicator ? (
                                <Async
                                    refetchOnChanged={[
                                        selectedIndicator,
                                        timeStore.start,
                                        timeStore.end,
                                        timeGranularityValue
                                    ]}
                                    fetchData={() => baseJSONClient(
                                        `/api/metrics/integrations/correlation/redash/${selectedIndicator}`,
                                        {
                                            method: 'post',
                                            body: {
                                                parameters: {
                                                    time_start: timeStore.start,
                                                    time_end: timeStore.end,
                                                    time_granularity:
                                                            timeGranularityValue
                                                },
                                                model_performance_query:
                                                        getSelectedQuery().query
                                            }
                                        }
                                    )
                                    }
                                    renderData={(correlationResponse) => (
                                        <span className='text-dark bold-text fs-1 d-flex justify-content-between gap-2'>
                                            <span>
                                                {correlationResponse.correlation.value.toFixed(
                                                    1
                                                )}
                                            </span>
                                            {correlationResponse.correlation
                                                .p_value < 0.05 && <span>*</span>}
                                            {correlationResponse.correlation
                                                .p_value < 0.01 && <span>*</span>}
                                        </span>
                                    )}
                                    renderError={() => (
                                        <span className='text-dark bold-text fs-1'>
                                            0
                                        </span>
                                    )}
                                />
                            ) : null}
                        </Col>
                        <Col className='p-0 d-flex' lg={8}>
                            {selectedIndicator ? (
                                <Async
                                    refetchOnChanged={[
                                        selectedIndicator,
                                        timeStore.start,
                                        timeStore.end,
                                        timeGranularityValue
                                    ]}
                                    fetchData={() => baseJSONClient(
                                        `/api/metrics/integrations/redash/${selectedIndicator}`,
                                        {
                                            method: 'post',
                                            body: {
                                                parameters: {
                                                    time_start: timeStore.start
                                                        .utc()
                                                        .format(),
                                                    time_end: timeStore.end
                                                        .utc()
                                                        .format(),
                                                    time_granularity:
                                                            timeGranularityValue
                                                }
                                            }
                                        }
                                    )
                                    }
                                    renderData={({results = []}) => (
                                        <AreaGraph
                                            dots={results.map(
                                                ({accuracy, time}) => ({
                                                    x: time,
                                                    y: accuracy * 100
                                                })
                                            )}
                                            hasBorder={false}
                                            isTimeDependent
                                            margin={{
                                                right: 0,
                                                bottom: 30,
                                                left: 5
                                            }}
                                            xAxisName='Time'
                                            yAxisDomain={[0, 100]}
                                            yAxisName={getName(
                                                modelPerformanceIndicators.find(
                                                    ({value}) => value === selectedIndicator
                                                )?.name
                                            )}
                                        />
                                    )}
                                />
                            ) : null}
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
