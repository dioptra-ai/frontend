/* eslint-disable max-lines */
import baseJSONClient from 'clients/base-json-client';
import metricsClient from 'clients/metrics';
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
import CountEvents from 'components/count-events';

const ModelPerformanceMetrics = {
    ACCURACY: {value: 'ACCURACY', name: 'Accuracy'},
    F1_SCORE: {value: 'F1_SCORE', name: 'F1 Score'},
    PRECISION: {value: 'PRECISION', name: 'Precision'},
    RECALL: {value: 'RECALL', name: 'Recall'},
    EXACT_MATCH: {value: 'EXACT_MATCH', name: 'Exact Match'},
    MEAN_AVERAGE_PRECISION: {value: 'MEAN_AVERAGE_PRECISION', name: 'mAP'},
    MEAN_AVERAGE_RECALL: {value: 'MEAN_AVERAGE_RECALL', name: 'mAR'},
    SEMANTIC_SIMILARITY: {value: 'SEMANTIC_SIMILARITY', name: 'Semantic Similarity'}
};

const PerformanceOverview = ({timeStore, filtersStore}) => {
    const [modelPerformanceIndicators, setModelPerformanceIndicators] = useState([]);
    const [selectedIndicator, setSelectedIndicator] = useState(null);
    const allSqlFilters = useAllSqlFilters();
    const sqlFiltersWithModelTime = useAllSqlFilters({useReferenceRange: true});
    const model = useModel();
    const [iou] = useState(0.5);
    const selectableMetrics = model.mlModelType === 'Q_N_A' ? [
        {value: 'EXACT_MATCH', name: 'Exact Match'},
        {value: 'F1_SCORE', name: 'F1 Score'},
        {value: 'SEMANTIC_SIMILARITY', name: 'Semantic Similarity'}
    ] : model.mlModelType === 'DOCUMENT_PROCESSING' ? [
        {value: 'MEAN_AVERAGE_PRECISION', name: 'mAP'},
        {value: 'MEAN_AVERAGE_RECALL', name: 'mAR'},
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

    const sampleSizeComponent = (<CountEvents sqlFilters={allSqlFilters}/>);
    const timeGranularityValue = timeStore.getTimeGranularity();
    const timeGranularity = timeGranularityValue.toISOString();

    const getQueryForMetric = (metricName, timeGranularity, sqlFilters = allSqlFilters) => {

        return {
            [ModelPerformanceMetrics.ACCURACY.value]: () => {

                return metricsClient('accuracy-metric', {
                    sql_filters: sqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            [ModelPerformanceMetrics.PRECISION.value]: () => {

                return metricsClient('precision-metric', {
                    sql_filters: sqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            [ModelPerformanceMetrics.RECALL.value]: () => {

                return metricsClient('recall-metric', {
                    sql_filters: sqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            [ModelPerformanceMetrics.F1_SCORE.value]: () => {

                return metricsClient('f1-score-metric', {
                    sql_filters: sqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            [ModelPerformanceMetrics.EXACT_MATCH.value]: () => {

                return metricsClient('exact-match', {
                    sql_filters: sqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            [ModelPerformanceMetrics.SEMANTIC_SIMILARITY.value]: () => {

                return metricsClient('semantic-similarity', {
                    sql_filters: sqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            [ModelPerformanceMetrics.MEAN_AVERAGE_PRECISION.value]: () => {

                return metricsClient('map', {
                    sql_filters: sqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType,
                    iou_threshold: iou
                });
            },
            [ModelPerformanceMetrics.MEAN_AVERAGE_RECALL.value]: () => {

                return metricsClient('mar', {
                    sql_filters: sqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType,
                    iou_threshold: iou
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
                                    dots={data}
                                    xDataKey='time'
                                    yDataKey='value'
                                    title='Average Throughput (QPS)'
                                    xAxisName='Time'
                                />
                            )}
                            fetchData={() => metricsClient('throughput', {
                                sql_filters: allSqlFilters,
                                granularity_iso: timeStore
                                    .getTimeGranularity()
                                    .toISOString(),
                                granularity_sec: timeStore
                                    .getTimeGranularity()
                                    .asSeconds()
                            })}
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
                                fetchData={getQueryForMetric('EXACT_MATCH')}
                                refetchOnChanged={[model, allSqlFilters]}
                                renderData={([d]) => (
                                    <MetricInfoBox
                                        name='EM'
                                        subtext={sampleSizeComponent}
                                        unit='%'
                                        value={100 * d?.value}
                                    />
                                )}
                            />
                        </Col>
                        <Col className='d-flex' lg={3}>
                            <Async
                                fetchData={getQueryForMetric('F1_SCORE')}
                                refetchOnChanged={[model, allSqlFilters]}
                                renderData={([d]) => (
                                    <MetricInfoBox
                                        name='F1 Score'
                                        subtext={sampleSizeComponent}
                                        unit='%'
                                        value={100 * d?.value}
                                    />
                                )}
                            />
                        </Col>
                        <Col className='d-flex' lg={3}>
                            <Async
                                fetchData={getQueryForMetric('SEMANTIC_SIMILARITY')}
                                refetchOnChanged={[timeGranularity, model, allSqlFilters]}
                                renderData={([d]) => (
                                    <MetricInfoBox
                                        name='Semantic Similarity'
                                        sampleSize={sampleSizeComponent}
                                        unit='%'
                                        value={100 * d?.value}
                                    />
                                )}
                            />
                        </Col>
                    </Row>
                ) : model.mlModelType === 'DOCUMENT_PROCESSING' ? (
                    <Row className='mb-3 align-items-stretch'>
                        <Col className='d-flex' lg={3}>
                            <Async
                                fetchData={getQueryForMetric('MEAN_AVERAGE_PRECISION')}
                                refetchOnChanged={[allSqlFilters]}
                                renderData={([d]) => (
                                    <MetricInfoBox
                                        name='mAP'
                                        subtext='iou=0.5'
                                        value={d?.value}
                                    />
                                )}
                            />
                        </Col>
                        <Col className='d-flex' lg={3}>
                            <Async
                                fetchData={getQueryForMetric('MEAN_AVERAGE_RECALL')}
                                refetchOnChanged={[allSqlFilters]}
                                renderData={([d]) => (
                                    <MetricInfoBox
                                        name='mAR'
                                        subtext='iou=0.5'
                                        value={d?.value}
                                    />
                                )}
                            />
                        </Col>
                        <Col className='d-flex' lg={3}>
                            <Async
                                fetchData={getQueryForMetric('EXACT_MATCH')}
                                refetchOnChanged={[allSqlFilters]}
                                renderData={([d]) => (
                                    <MetricInfoBox
                                        name='Exact Match'
                                        subtext='iou=0.5'
                                        value={d?.value}
                                    />
                                )}
                            />
                        </Col>
                    </Row>
                ) : (
                    <Row className='mb-3 align-items-stretch'>
                        <Col className='d-flex' lg={3}>
                            <Async
                                renderData={([[data], [benchmarkData]]) => (
                                    <MetricInfoBox
                                        name='Accuracy'
                                        subtext={sampleSizeComponent}
                                        unit='%'
                                        value={100 * data?.value}
                                        difference={100 * (data?.value - benchmarkData?.value)}
                                    />
                                )}
                                fetchData={[
                                    getQueryForMetric('ACCURACY'),
                                    getQueryForMetric('ACCURACY', null, sqlFiltersWithModelTime)
                                ]}
                                refetchOnChanged={[allSqlFilters, sqlFiltersWithModelTime, model.mlModelType]}
                            />
                        </Col>
                        <Col className='d-flex' lg={3}>
                            <Async
                                renderData={([[data], [benchmarkData]]) => (
                                    <MetricInfoBox
                                        name='F1 Score'
                                        subtext={sampleSizeComponent}
                                        unit='%'
                                        value={100 * data?.value}
                                        difference={100 * (data?.value - benchmarkData?.value)}
                                    />
                                )}
                                fetchData={[
                                    getQueryForMetric('F1_SCORE'),
                                    getQueryForMetric('F1_SCORE', null, sqlFiltersWithModelTime)
                                ]}
                                refetchOnChanged={[allSqlFilters, sqlFiltersWithModelTime, model.mlModelType]}
                            />
                        </Col>
                        <Col className='d-flex' lg={3}>
                            <Async
                                renderData={([[data], [benchmarkData]]) => (
                                    <MetricInfoBox
                                        name='Recall'
                                        subtext={sampleSizeComponent}
                                        unit='%'
                                        value={100 * data?.value}
                                        difference={100 * (data?.value - benchmarkData?.value)}
                                    />
                                )}
                                fetchData={[
                                    getQueryForMetric('RECALL'),
                                    getQueryForMetric('RECALL', null, sqlFiltersWithModelTime)
                                ]}
                                refetchOnChanged={[allSqlFilters, sqlFiltersWithModelTime, model.mlModelType]}
                            />
                        </Col>
                        <Col className='d-flex' lg={3}>
                            <Async
                                renderData={([[data], [benchmarkData]]) => (
                                    <MetricInfoBox
                                        name='Precision'
                                        subtext={sampleSizeComponent}
                                        unit='%'
                                        value={100 * data?.value}
                                        difference={
                                            100 * (data?.value - benchmarkData?.value)
                                        }
                                    />
                                )}
                                fetchData={[
                                    getQueryForMetric('PRECISION'),
                                    getQueryForMetric('PRECISION', null, sqlFiltersWithModelTime)
                                ]}
                                refetchOnChanged={[allSqlFilters, sqlFiltersWithModelTime, model.mlModelType]}
                            />
                        </Col>
                    </Row>
                )}
                <div className='border rounded p-3'>
                    <Async
                        defaultData={[]}
                        renderData={(metric) => {

                            return (
                                <AreaGraph
                                    dots={metric.map((m) => ({...m, value: 100 * m.value}))}
                                    hasBorder={false}
                                    isTimeDependent
                                    margin={{right: 0, bottom: 30}}
                                    unit='%'
                                    xAxisName='Time'
                                    yAxisDomain={[0, 100]}
                                    xDataKey='time'
                                    yDataKey='value'
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
                                    metric={selectedMetric}
                                />
                            );
                        }}
                        refetchOnChanged={[
                            selectedMetric,
                            timeGranularityValue,
                            allSqlFilters
                        ]}
                        fetchData={getQueryForMetric(selectedMetric, timeGranularityValue)}
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
