/* eslint-disable max-lines */
import baseJSONClient from 'clients/base-json-client';
import metricsClient from 'clients/metrics';
import AreaGraph from 'components/area-graph';
import Async from 'components/async';
import FilterInput from 'components/filter-input';
import MetricInfoBox from 'components/metric-info-box';
import Select from 'components/select';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import useModel from 'hooks/use-model';
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
import useTimeGranularity from 'hooks/use-time-granularity';

const ModelPerformanceMetrics = {
    ACCURACY: {value: 'ACCURACY', name: 'Accuracy'},
    F1_SCORE: {value: 'F1_SCORE', name: 'F1 Score'},
    PRECISION: {value: 'PRECISION', name: 'Precision'},
    RECALL: {value: 'RECALL', name: 'Recall'},
    EXACT_MATCH: {value: 'EXACT_MATCH', name: 'Exact Match'},
    MEAN_AVERAGE_PRECISION: {value: 'MEAN_AVERAGE_PRECISION', name: 'mAP'},
    MEAN_AVERAGE_RECALL: {value: 'MEAN_AVERAGE_RECALL', name: 'mAR'},
    SEMANTIC_SIMILARITY: {value: 'SEMANTIC_SIMILARITY', name: 'Semantic Similarity'},
    CONFIDENCE: {value: 'CONFIDENCE', name: 'Confidence'}
};

const CorrelationToKPIs = ({timeStore, filtersStore}) => {
    const [modelPerformanceIndicators, setModelPerformanceIndicators] = useState([]);
    const [selectedIndicator, setSelectedIndicator] = useState(null);
    const allSqlFilters = useAllSqlFilters({
        __REMOVE_ME__excludeOrgId: true
    });
    const sqlFiltersWithModelTime = useAllSqlFilters({
        useReferenceRange: true,
        __REMOVE_ME__excludeOrgId: true
    });
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
    ] : model.mlModelType === 'UNSUPERVISED_OBJECT_DETECTION' ? [
        {value: 'CONFIDENCE', name: 'Confidence'}
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
    const timeGranularity = useTimeGranularity()?.toISOString();

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
            },
            [ModelPerformanceMetrics.CONFIDENCE.value]: () => {

                return metricsClient('confidence', {
                    sql_filters: sqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            }
        }[metricName];
    };

    return (
        <>
            <div className='border rounded p-3'>
                <Async
                    defaultData={[]}
                    renderData={(metric) => {

                        return (
                            <AreaGraph
                                dots={metric.map((m) => ({...m, value: 100 * m.value}))}
                                hasBorder={false}
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
                            />
                        );
                    }}
                    refetchOnChanged={[
                        selectedMetric,
                        timeGranularity,
                        allSqlFilters
                    ]}
                    fetchData={getQueryForMetric(selectedMetric, timeGranularity)}
                />
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
                                                    .duration(timeGranularity)
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
                                        timeGranularity
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
                                                        timeGranularity
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

CorrelationToKPIs.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(CorrelationToKPIs);
