/* eslint-disable max-lines */
import baseJSONClient from 'clients/base-json-client';
import AreaGraph from 'components/area-graph';
import Async from 'components/async';
import FilterInput from 'components/filter-input';
import MetricInfoBox from 'components/metric-info-box';
import Select from 'components/select';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import useModel from 'customHooks/use-model';
import {setupComponent} from 'helpers/component-helper';
import {getName} from 'helpers/name-helper';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {Tooltip as BootstrapTooltip, OverlayTrigger} from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import {FaExclamation} from 'react-icons/fa';
import metricsClient from 'clients/metrics';

const ModelPerformanceMetrics = {
    ACCURACY: {value: 'ACCURACY', name: 'Accuracy'},
    F1_SCORE: {value: 'F1_SCORE', name: 'F1 Score'},
    PRECISION: {value: 'PRECISION', name: 'Precision'},
    RECALL: {value: 'RECALL', name: 'Recall'},
    EXACT_MATCH: {value: 'EXACT_MATCH', name: 'Exact Match'}
};

const PerformanceOverview = ({timeStore, filtersStore}) => {
    const [modelPerformanceIndicators, setModelPerformanceIndicators] = useState([]);
    const [selectedIndicator, setSelectedIndicator] = useState(null);
    const allSqlFilters = useAllSqlFilters();
    const sqlFiltersWithModelTime = useAllSqlFilters({useReferenceRange: true});
    const model = useModel();
    const [iou] = useState(0.5);
    // TODO: Uncomment when this is implemented
    // ] : model.mlModelType === 'DOCUMENT_PROCESSING' ? [
    // {value: 'MAP', name: 'mAP'},
    // {value: 'MAR', name: 'mAR'}
    const selectableMetrics = model.mlModelType === 'Q_N_A' ? [
        {value: 'EXACT_MATCH', name: 'Exact Match'},
        {value: 'F1_SCORE', name: 'F1 Score'}
    ] : [
        {value: 'ACCURACY', name: 'Accuracy'},
        {value: 'F1_SCORE', name: 'F1 Score'},
        {value: 'PRECISION', name: 'Precision'},
        {value: 'RECALL', name: 'Recall'}
    ];
    const [selectedMetric, setSelectedMetric] = useState(selectableMetrics[0].value);

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
        <Async
            defaultData={[{sampleSize: 0}]}
            renderData={([{sampleSize}]) => sampleSize}
            fetchData={() => metricsClient('query/sample-size', {sql_filters: allSqlFilters})}
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

    const getQueryForMetric = (metricName, timeGranularity) => {
        return {
            [ModelPerformanceMetrics.ACCURACY.value]: () => {
                return metricsClient('accuracy-metric', {
                    sql_filters: model.mlModelType === 'DOCUMENT_PROCESSING' ?
                        `cast("iou" as FLOAT) > ${iou} AND ${allSqlFilters}` : allSqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            [ModelPerformanceMetrics.PRECISION.value]: () => {
                return metricsClient('precision-metric', {
                    sql_filters: model.mlModelType === 'DOCUMENT_PROCESSING' ?
                        `cast("iou" as FLOAT) > ${iou} AND ${allSqlFilters}` : allSqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            [ModelPerformanceMetrics.RECALL.value]: () => {
                return metricsClient('recall-metric', {
                    sql_filters: model.mlModelType === 'DOCUMENT_PROCESSING' ?
                        `cast("iou" as FLOAT) > ${iou} AND ${allSqlFilters}` : allSqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            [ModelPerformanceMetrics.F1_SCORE.value]: () => {
                return metricsClient('f1-score-metric', {
                    sql_filters: model.mlModelType === 'DOCUMENT_PROCESSING' ?
                        `cast("iou" as FLOAT) > ${iou} AND ${allSqlFilters}` : allSqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            [ModelPerformanceMetrics.EXACT_MATCH.value]: () => {
                return metricsClient('exact-match', {
                    sql_filters: allSqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            }
        }[metricName];
    };

    return (
        <>
            <FilterInput
                defaultFilters={filtersStore.filters}
                onChange={(filters) => (filtersStore.filters = filters)}
            />
            <div className='my-2'>
                <Row>
                    <Col>
                        <Async
                            renderData={(data) => (
                                <AreaGraph
                                    dots={data.map(({throughput, __time}) => ({
                                        y: throughput,
                                        x: new Date(__time).getTime()
                                    }))}
                                    isTimeDependent
                                    title='Average Throughput (QPS)'
                                    xAxisName='Time'
                                />
                            )}
                            fetchData={() => metricsClient('throughput', {
                                sql_filters: allSqlFilters,
                                granular_time_as_string: timeStore
                                    .getTimeGranularity()
                                    .toISOString(),
                                granular_time_as_seconds: timeStore
                                    .getTimeGranularity()
                                    .asSeconds()
                            })
                            }
                            refetchOnChanged={[
                                allSqlFilters,
                                timeStore.getTimeGranularity()
                            ]}
                        />
                    </Col>
                </Row>
            </div>
            <div className='my-3'>
                {model.mlModelType === 'Q_N_A' ? (
                    <Row className='mb-3 align-items-stretch'>
                        <Col className='d-flex' lg={3}>
                            <Async
                                fetchData={() => metricsClient('exact-match', {
                                    method: 'post',
                                    body: {
                                        sql_filters: allSqlFilters,
                                        model_type: model.mlModelType
                                    }
                                })
                                }
                                refetchOnChanged={[timeGranularity, model, allSqlFilters]}
                                renderData={([{exact_match} = {}]) => (
                                    <MetricInfoBox
                                        name='EM'
                                        sampleSize={sampleSizeComponent}
                                        unit='%'
                                        value={exact_match}
                                    />
                                )}
                            />
                        </Col>
                        <Col className='d-flex' lg={3}>
                            <Async
                                fetchData={() => metricsClient('f1-score-metric', {
                                    method: 'post',
                                    body: {
                                        sql_filters: allSqlFilters,
                                        model_type: model.mlModelType
                                    }
                                })
                                }
                                refetchOnChanged={[timeGranularity, model, allSqlFilters]}
                                renderData={([{f1_score} = {}]) => (
                                    <MetricInfoBox
                                        name='F1 Score'
                                        sampleSize={sampleSizeComponent}
                                        unit='%'
                                        value={f1_score}
                                    />
                                )}
                            />
                        </Col>
                    </Row>
                ) : (
                    <Row className='mb-3 align-items-stretch'>
                        <Col className='d-flex' lg={3}>
                            <Async
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
                                fetchData={[
                                    () => metricsClient('query/accuracy', {
                                        prediction_name: predictionName,
                                        sql_filters: allSqlFilters,
                                        ground_truth_name: groundTruthName
                                    }),
                                    () => metricsClient('query/accuracy', {
                                        prediction_name: predictionName,
                                        sql_filters: sqlFiltersWithModelTime,
                                        ground_truth_name: groundTruthName
                                    })
                                ]}
                            />
                        </Col>
                        <Col className='d-flex' lg={3}>
                            <Async
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
                                fetchData={[
                                    () => metricsClient('query/f1-score', {
                                        prediction_name: predictionName,
                                        sql_filters: allSqlFilters,
                                        ground_truth_name: groundTruthName
                                    }),
                                    () => metricsClient('query/f1-score', {
                                        prediction_name: predictionName,
                                        sql_filters: sqlFiltersWithModelTime,
                                        ground_truth_name: groundTruthName
                                    })
                                ]}
                            />
                        </Col>
                        <Col className='d-flex' lg={3}>
                            <Async
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
                                fetchData={[
                                    () => metricsClient('query/recall', {
                                        prediction_name: predictionName,
                                        sql_filters: allSqlFilters,
                                        ground_truth_name: groundTruthName
                                    }),
                                    () => metricsClient('query/recall', {
                                        prediction_name: predictionName,
                                        sql_filters: allSqlFilters,
                                        ground_truth_name: groundTruthName
                                    })
                                ]}
                            />
                        </Col>
                        <Col className='d-flex' lg={3}>
                            <Async
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
                                fetchData={[
                                    () => metricsClient('query/precision', {
                                        prediction_name: predictionName,
                                        sql_filters: allSqlFilters,
                                        ground_truth_name: groundTruthName
                                    }),
                                    () => metricsClient('query/precision', {
                                        prediction_name: predictionName,
                                        sql_filters: sqlFiltersWithModelTime,
                                        ground_truth_name: groundTruthName
                                    })
                                ]}
                            />
                        </Col>
                    </Row>
                )}
                <div className='border rounded p-3'>
                    <Async
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
                                title={
                                    <Row>
                                        <Col>{getName(selectedMetric)}</Col>
                                        <Col lg={3}>
                                            <Select
                                                initialValue={selectedMetric}
                                                onChange={setSelectedMetric}
                                                options={selectableMetrics}
                                            />
                                        </Col>
                                    </Row>
                                }
                            />
                        )}
                        refetchOnChanged={[
                            selectedMetric,
                            timeGranularity,
                            model,
                            allSqlFilters
                        ]}
                        fetchData={getQueryForMetric(selectedMetric, timeStore.getTimeGranularity())}
                    />
                </div>
            </div>
            <div className='my-3'>
                <div className='border rounded p-3'>
                    <h3 className='text-dark bold-text fs-4'>
                        Key Performance Indicators
                    </h3>
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
                                        selectedMetric,
                                        selectedIndicator,
                                        timeStore.start,
                                        timeStore.end,
                                        timeStore.aggregationPeriod
                                    ]}
                                    fetchData={() => metricsClient(
                                        `integrations/correlation/redash/${selectedIndicator}`,
                                        {
                                            parameters: {
                                                time_start: timeStore.start,
                                                time_end: timeStore.end,
                                                time_granularity: moment
                                                    .duration(
                                                        timeGranularityValue
                                                    )
                                                    .asSeconds()
                                            },
                                            metric_name: selectedMetric,
                                            payload: {
                                                sql_filters:
                                                        model.mlModelType ===
                                                        'DOCUMENT_PROCESSING' ?
                                                            `cast("iou" as FLOAT) > ${iou} AND ${allSqlFilters}` :
                                                            allSqlFilters,
                                                time_granularity:
                                                        timeGranularity,
                                                model_type: model.mlModelType
                                            }
                                        }
                                    )
                                    }
                                    renderData={(correlationResponse) => correlationResponse.correlation && (
                                        <span className='text-dark bold-text fs-1 d-flex justify-content-between gap-2'>
                                            <span>
                                                {correlationResponse.correlation.value.toFixed(
                                                    2
                                                )}
                                                {correlationResponse.correlation
                                                    .p_value !== null &&
                                                        correlationResponse
                                                            .correlation.p_value <=
                                                            0.05 && <span> * </span>}
                                                {correlationResponse.correlation
                                                    .p_value !== null &&
                                                        correlationResponse
                                                            .correlation.p_value <=
                                                            0.01 && <span> * </span>}

                                                {(correlationResponse.correlation
                                                    .p_value === null ||
                                                        correlationResponse
                                                            .correlation.p_value >
                                                            0.05) && (
                                                    <OverlayTrigger
                                                        placement='bottom'
                                                        overlay={
                                                            <BootstrapTooltip>
                                                                    P Value of
                                                                    correlation
                                                                    coefficient is
                                                                    above 0.05 (P
                                                                    value:{' '}
                                                                {correlationResponse
                                                                    .correlation
                                                                    .p_value !==
                                                                    null ?
                                                                    correlationResponse.correlation.p_value.toFixed(
                                                                        2
                                                                    ) :
                                                                    'unavailable'})
                                                            </BootstrapTooltip>
                                                        }
                                                    >
                                                        <FaExclamation
                                                            className='cursor-pointer blinking'
                                                            style={{
                                                                position:
                                                                        'relative',
                                                                top: -10,
                                                                left: 6,
                                                                width: 20,
                                                                height: 20
                                                            }}
                                                        />
                                                    </OverlayTrigger>
                                                )}
                                            </span>
                                        </span>
                                    )
                                    }
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
                                    fetchData={() => metricsClient(
                                        `integrations/redash/${selectedIndicator}`,
                                        {
                                            parameters: {
                                                time_start: timeStore.start
                                                    .utc()
                                                    .format(),
                                                time_end: timeStore.end
                                                    .utc()
                                                    .format(),
                                                time_granularity: moment
                                                    .duration(
                                                        timeGranularityValue
                                                    )
                                                    .asSeconds()
                                            }
                                        }
                                    )
                                    }
                                    renderData={({results = []}) => {
                                        const dots = results.map(
                                            ({metric, time}) => ({
                                                x: new Date(time).getTime(),
                                                y: metric * 100
                                            })
                                        );

                                        return (
                                            <AreaGraph
                                                dots={dots}
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
                                        );
                                    }}
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
