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
import CorrelationToKPIs from 'pages/common/correlation-to-kpis';

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

const PerformanceOverview = ({timeStore, filtersStore}) => {
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
                ) : model.mlModelType === 'UNSUPERVISED_OBJECT_DETECTION' ? (
                    <Row className='mb-3 align-items-stretch'>
                        <Col className='d-flex' lg={3}>
                            <Async
                                fetchData={getQueryForMetric('CONFIDENCE')}
                                refetchOnChanged={[model, allSqlFilters]}
                                renderData={([d]) => (
                                    <MetricInfoBox
                                        name='Confidence'
                                        subtext={sampleSizeComponent}
                                        unit='%'
                                        value={100 * d?.value}
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
                <CorrelationToKPIs/>
            </div>
        </>
    );
};

PerformanceOverview.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(PerformanceOverview);
