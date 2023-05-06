import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import {Bar} from 'recharts';
import {StringParam, useQueryParam, withDefault} from 'use-query-params';

import {getName} from 'helpers/name-helper';
import {getHexColor} from 'helpers/color-helper';
import BarGraph from 'components/bar-graph';
import Async from 'components/async';
import Select from 'components/select';
import metricsClient from 'clients/metrics';

const SELECTABLE_METRICS = [
    // 'ACCURACY',
    'PRECISION',
    'RECALL',
    'F1_SCORE'
    // 'MEAN_IOU'
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
        <Row className='g-2 my-3'>
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
                            title={areMetricsStale ? 'Click evaluate to refresh...' : modelMetrics[0]['title'] || getName(userSelectedMetric)}
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
                        if (!modelMetrics['value_per_class']) {
                            return null;
                        }

                        const classes = Array.from(new Set(modelMetrics.flatMap((modelMetric) => Object.keys(modelMetric['value_per_class'])))).sort();
                        const unit = metricSpecs[0].unit;

                        return (
                            <BarGraph
                                verticalIfMoreThan={10}
                                bars={classes.map((className) => ({
                                    name: className,
                                    ...modelMetrics.reduce((acc, modelMetric, index) => ({
                                        ...acc,
                                        [modelNames[index]]: modelMetric['value_per_class'][className]
                                    }), {})
                                }))}
                                title={areMetricsStale ? 'Click evaluate to refresh...' : modelMetrics[0]['title'] || `${getName(userSelectedMetric)} per Class`}
                                unit={unit}
                                yAxisTickFormatter={metricSpecs[0].formatter}
                            >
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
    );
};

ModelMetrics.propTypes = {
    modelNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasetId: PropTypes.string,
    filters: PropTypes.arrayOf(PropTypes.object)
};

export default ModelMetrics;

const useMetric = (metric, modelName, datapointFilters, datasetId) => {

    return {
        ACCURACY: {
            fetchData: () => metricsClient('evaluate/accuracy', {
                model_name: modelName,
                datapoint_filters: datapointFilters,
                dataset_id: datasetId
            }, {memoized: true}),
            unit: '%'
        },
        MEAN_IOU: {
            fetchData: () => metricsClient('evaluate/mean-iou', {
                model_name: modelName,
                datapoint_filters: datapointFilters,
                dataset_id: datasetId
            }, {memoized: true}),
            unit: '%'
        },
        F1_SCORE: {
            fetchData: () => metricsClient('evaluate/f1', {
                model_name: modelName,
                datapoint_filters: datapointFilters,
                dataset_id: datasetId
            }, {memoized: true}),
            unit: '%'
        },
        PRECISION: {
            fetchData: () => metricsClient('evaluate/precision', {
                model_name: modelName,
                datapoint_filters: datapointFilters,
                dataset_id: datasetId
            }, {memoized: true}),
            unit: '%'
        },
        RECALL: {
            fetchData: () => metricsClient('evaluate/recall', {
                model_name: modelName,
                datapoint_filters: datapointFilters,
                dataset_id: datasetId
            }, {memoized: true}),
            unit: '%'
        }
    }[metric];
};
