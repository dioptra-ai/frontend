import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {Bar, Tooltip} from 'recharts';
import {StringParam, useQueryParam, withDefault} from 'use-query-params';

import {getName} from 'helpers/name-helper';
import {getHexColor} from 'helpers/color-helper';
import BarGraph, {Tooltip as CustomTooltip} from 'components/bar-graph';
import Async from 'components/async';
import Select from 'components/select';
import metricsClient from 'clients/metrics';

const SELECTABLE_METRICS = [
    'ACCURACY',
    'MEAN_IOU'
];

const MetricParam = withDefault(StringParam, SELECTABLE_METRICS[0]);

const ModelMetrics = ({modelNames, datasetId, filters}) => {
    const [userSelectedMetric, setUserSelectedMetric] = useQueryParam('metric', MetricParam);
    const metricSpecs = modelNames.map((modelName) => useMetric(userSelectedMetric, modelName, filters, datasetId));
    const fetchAllData = () => Promise.all(metricSpecs.map((metricSpec) => metricSpec.fetchData()));

    return (
        <Row className='g-2 my-2'>
            <Col xs={12}>
                <Select value={userSelectedMetric} onChange={setUserSelectedMetric}>
                    {SELECTABLE_METRICS.map((metric) => (
                        <option key={metric} value={metric}>{getName(metric)}</option>
                    ))}
                </Select>
            </Col>
            <Col xs={12}>
                <Async
                    fetchData={fetchAllData}
                    refetchOnChanged={[filters, datasetId, modelNames, userSelectedMetric]}
                    renderData={(modelMetrics) => (
                        <BarGraph
                            bars={modelMetrics.map((modelMetric, index) => ({
                                name: modelNames[index],
                                value: modelMetric['value'],
                                fill: getHexColor(modelNames[index])
                            }))}
                            title={`${getName(userSelectedMetric)} per Model`}
                            unit={metricSpecs[0].unit}
                            yAxisTickFormatter={metricSpecs[0].formatter}
                        />
                    )}
                />
            </Col>
            <Col xs={12}>
                <Async
                    fetchData={fetchAllData}
                    refetchOnChanged={[filters, datasetId, modelNames, userSelectedMetric]}
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
                                title={`${getName(userSelectedMetric)} per Class`}
                                unit={unit}
                                yAxisTickFormatter={metricSpecs[0].formatter}
                            >
                                <Tooltip animationDuration={200} content={<CustomTooltip unit={unit} />} />
                                {modelNames.map((modelName) => (
                                    <Bar dataKey={modelName} maxBarSize={50} minPointSize={2} fill={getHexColor(modelName)} key={modelName}/>
                                ))}
                            </BarGraph>
                        );
                    }}
                />
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

const useMetric = (metric, modelName, filters, datasetId) => {

    return {
        ACCURACY: {
            fetchData: () => {

                return metricsClient('evaluate/accuracy', {
                    model_name: modelName,
                    datapoint_filters: filters,
                    dataset_id: datasetId
                });
            },
            unit: '%'
        },
        MEAN_IOU: {
            fetchData: () => {

                return metricsClient('evaluate/mean-iou', {
                    model_name: modelName,
                    datapoint_filters: filters,
                    dataset_id: datasetId
                });
            },
            unit: '%'
        }
    }[metric];
};
