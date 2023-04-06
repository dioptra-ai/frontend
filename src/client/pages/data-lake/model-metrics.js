import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import {Bar, Tooltip} from 'recharts';
import {StringParam, useQueryParam, withDefault} from 'use-query-params';

import {getName} from 'helpers/name-helper';
import {getHexColor} from 'helpers/color-helper';
import BarGraph, {Tooltip as CustomTooltip} from 'components/bar-graph';
import Async from 'components/async';
import Select from 'components/select';
import metricsClient from 'clients/metrics';
import baseJSONClient from 'clients/base-json-client';

const SELECTABLE_METRICS = [
    'ACCURACY',
    'PRECISION',
    'RECALL',
    'F1_SCORE',
    'MEAN_IOU'
];

const MetricParam = withDefault(StringParam, SELECTABLE_METRICS[0]);

const ModelMetrics = ({modelNames, datasetId, filters}) => {
    const [userSelectedMetric, setUserSelectedMetric] = useQueryParam('metric', MetricParam);
    const [areMetricsStale, setAreMetricsStale] = useState(true);
    const [lastEvaluationRequested, setLastEvaluationRequested] = useState(null);
    const metricSpecs = modelNames.map((modelName) => useMetric(userSelectedMetric, modelName, filters, datasetId));
    const fetchAllMetricsData = () => Promise.all(metricSpecs.map((metricSpec) => metricSpec.fetchData()));
    const screenComponent = (
        <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: areMetricsStale ? 'flex' : 'none'
        }} />
    );

    useEffect(() => {
        setAreMetricsStale(true);
    }, [filters, datasetId, modelNames, userSelectedMetric]);

    useEffect(() => {
        setAreMetricsStale(!lastEvaluationRequested);
    }, [lastEvaluationRequested]);

    return (
        <>
            <Row className='g-2 my-2'>

                <Col>
                    <Async fetchData={async () => {
                        const datapoints = await baseJSONClient.post('/api/datapoints/select', {
                            filters, datasetId, selectColumns: ['id']
                        });

                        return baseJSONClient.post('/api/metrics/distribution/predictions', {
                            filters: [{
                                left: 'datapoint',
                                op: 'in',
                                right: datapoints.map((datapoint) => datapoint.id)
                            }, {
                                left: 'model_name',
                                op: 'in',
                                right: modelNames
                            }]
                        });
                    }}
                    refetchOnChanged={[filters, datasetId]}
                    renderData={(groundtruthDistribution) => groundtruthDistribution.histogram && Object.keys(groundtruthDistribution.histogram).length ? (
                        <BarGraph
                            title='Predictions'
                            verticalIfMoreThan={10}
                            bars={Object.entries(groundtruthDistribution.histogram).map(([name, value]) => ({
                                name, value, fill: getHexColor(name)
                            }))}
                            yAxisTickFormatter={(v) => Number(v).toLocaleString()}
                        />
                    ) : null
                    } />
                </Col>
                <Col xs={12}>
                    <Select value={userSelectedMetric} onChange={setUserSelectedMetric}>
                        {SELECTABLE_METRICS.map((metric) => (
                            <option key={metric} value={metric}>{getName(metric)}</option>
                        ))}
                    </Select>
                </Col>
                <Col xs={12}>
                    <Button
                        onClick={() => setLastEvaluationRequested(Date.now())}
                        variant='secondary' size='s' className='text-nowrap w-100'
                        disabled={!areMetricsStale}
                    >Evaluate</Button>
                </Col>
                <Col xs={12} className='position-relative'>
                    <Async
                        fetchData={fetchAllMetricsData}
                        refetchOnChanged={[lastEvaluationRequested]}
                        fetchInitially={false}
                        renderData={(modelMetrics) => (
                            <BarGraph
                                bars={modelMetrics.map((modelMetric, index) => ({
                                    name: areMetricsStale ? '-' : modelNames[index],
                                    value: modelMetric['value'],
                                    fill: areMetricsStale ? '#ccc' : getHexColor(modelNames[index])
                                }))}
                                title={areMetricsStale ? 'Click evaluate to refresh...' : getName(userSelectedMetric)}
                                unit={metricSpecs[0].unit}
                                yAxisTickFormatter={metricSpecs[0].formatter}
                            />
                        )}
                    />
                    {screenComponent}
                </Col>
                <Col xs={12} className='position-relative'>
                    <Async
                        fetchData={fetchAllMetricsData}
                        refetchOnChanged={[lastEvaluationRequested]}
                        fetchInitially={false}
                        renderData={(modelMetrics) => {
                            const classes = Array.from(new Set(modelMetrics.flatMap((modelMetric) => Object.keys(modelMetric['value_per_class'])))).sort();
                            const unit = metricSpecs[0].unit;

                            return (
                                <BarGraph
                                    bars={classes.map((className) => ({
                                        name: className,
                                        ...modelMetrics.reduce((acc, modelMetric, index) => ({
                                            ...acc,
                                            [modelNames[index]]: modelMetric['value_per_class'][className]
                                        }), {})
                                    }))}
                                    title={areMetricsStale ? 'Click evaluate to refresh...' : `${getName(userSelectedMetric)} per Class`}
                                    unit={unit}
                                    yAxisTickFormatter={metricSpecs[0].formatter}
                                >
                                    <Tooltip animationDuration={200} content={<CustomTooltip unit={unit} />} />
                                    {modelNames.map((modelName) => (
                                        <Bar
                                            dataKey={modelName} maxBarSize={50} minPointSize={2}
                                            fill={areMetricsStale ? '#ccc' : getHexColor(modelName)}
                                            key={modelName}
                                        />
                                    ))}
                                </BarGraph>
                            );
                        }}
                    />
                    {screenComponent}
                </Col>
            </Row>
        </>
    );
};

ModelMetrics.propTypes = {
    modelNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasetId: PropTypes.string,
    filters: PropTypes.arrayOf(PropTypes.object)
};

export default ModelMetrics;

const useMetric = (metric, modelName, filters, datasetId) => {

    return {
        ACCURACY: {
            fetchData: () => metricsClient('evaluate/accuracy', {
                model_name: modelName,
                datapoint_filters: filters,
                dataset_id: datasetId
            }),
            unit: '%'
        },
        MEAN_IOU: {
            fetchData: () => metricsClient('evaluate/mean-iou', {
                model_name: modelName,
                datapoint_filters: filters,
                dataset_id: datasetId
            }),
            unit: '%'
        },
        F1_SCORE: {
            fetchData: () => metricsClient('evaluate/f1', {
                model_name: modelName,
                datapoint_filters: filters,
                dataset_id: datasetId
            }),
            unit: '%'
        },
        PRECISION: {
            fetchData: () => metricsClient('evaluate/precision', {
                model_name: modelName,
                datapoint_filters: filters,
                dataset_id: datasetId
            }),
            unit: '%'
        },
        RECALL: {
            fetchData: () => metricsClient('evaluate/recall', {
                model_name: modelName,
                datapoint_filters: filters,
                dataset_id: datasetId
            }),
            unit: '%'
        }
    }[metric];
};
