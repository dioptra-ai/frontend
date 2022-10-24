import PropTypes from 'prop-types';
import {useState} from 'react';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import {Textfit} from 'react-textfit';

import {getName} from 'helpers/name-helper';
import AreaGraph from 'components/area-graph';
import Select from 'components/select';
import Async from 'components/async';
import useTimeGranularity from 'hooks/use-time-granularity';
import metricsClient from 'clients/metrics';
import useModel from 'hooks/use-model';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import useAllFilters from 'hooks/use-all-filters';

const MetricChart = ({selectableMetrics, selectedMetric, type}) => {
    const [userSelectedMetric, setUserSelectedMetric] = useState(selectedMetric || selectableMetrics[0]);
    const timeGranularity = type === 'timeseries' ? useTimeGranularity()?.toISOString() : null;
    const {
        fetchData, unit,
        formatValue = String,
        name: metricName = getName(userSelectedMetric)
    } = useMetric(userSelectedMetric, timeGranularity);

    return (
        <Async
            fetchData={fetchData}
            refetchOnChanged={[fetchData]}
            renderData={(metric) => {

                switch (type) {
                case 'stat':

                    return (
                        <div className='border rounded p-3 w-100 d-flex flex-column align-items-center justify-content-center metric-box'>
                            <span className='text-dark-bold bold-text text-nowrap'>
                                {metricName}
                            </span>
                            <span className='text-dark text-center w-100'>
                                <Textfit mode='single' max={50}>
                                    {formatValue(metric[0]?.value)}{unit}
                                </Textfit>
                            </span>
                        </div>
                    );
                case 'timeseries':

                    return (
                        <div className='border rounded p-3'>
                            <AreaGraph
                                dots={metric}
                                hasBorder={false}
                                margin={{right: 0, bottom: 30}}
                                unit={unit}
                                formatValue={formatValue}
                                xAxisName='Time'
                                yAxisDomain={
                                    (userSelectedMetric === 'COSINE_SPEARMAN_CORRELATION' ||
                                        userSelectedMetric === 'COSINE_PEARSON_CORRELATION') ? [-1, 1] : [0, 1]
                                }
                                title={
                                    <Row>
                                        <Col>{metricName}</Col>
                                        <Col lg={3}>
                                            <Select
                                                initialValue={userSelectedMetric}
                                                onChange={setUserSelectedMetric}
                                                options={selectableMetrics.map((value) => ({
                                                    value,
                                                    name: getName(value)
                                                }))}
                                            />
                                        </Col>
                                    </Row>
                                }
                            />
                        </div>
                    );
                default:
                    throw new Error(`No such MetricChart type: ${type}`);
                }
            }}
        />
    );
};

MetricChart.propTypes = {
    selectableMetrics: PropTypes.array,
    type: PropTypes.string.isRequired,
    selectedMetric: PropTypes.string
};

const formatPercent = (v) => {
    if (isNaN(v)) {

        return '-';
    } else {

        return Number(100 * v).toFixed(2);
    }
};

const formatNumber = (v) => {
    if (isNaN(v)) {

        return '-';
    } else {

        return Number(v).toLocaleString();
    }
};

const useMetric = (metric, timeGranularity) => {
    const model = useModel();
    const allSqlFilters = useAllSqlFilters({
        __REMOVE_ME__excludeOrgId: true
    });
    const allFilters = useAllFilters();
    const allOfflineSqlFilters = useAllSqlFilters({useReferenceFilters: true});
    const result = {
        THROUGHPUT: {
            fetchData: () => {

                return metricsClient('throughput', {
                    filters: allFilters,
                    time_granularity: timeGranularity
                });
            },
            formatValue: formatNumber,
            unit: ''
        },
        EMBEDDING_DRIFT: {
            fetchData: () => {

                return metricsClient('compute', {
                    metrics_type: 'bi_non_cat_distance',
                    reference_filters: allOfflineSqlFilters,
                    current_filters: allSqlFilters,
                    time_granularity: timeGranularity
                });
            },
            formatValue: formatNumber
        },
        FEATURES_DRIFT: {
            fetchData: () => {

                // TODO: implement this
                return metricsClient('compute', {
                    metrics_type: 'bi_non_cat_distance',
                    reference_filters: allOfflineSqlFilters,
                    current_filters: allSqlFilters,
                    time_granularity: timeGranularity
                });
            },
            formatValue: formatNumber
        },
        ACCURACY: {
            fetchData: () => {

                return metricsClient('accuracy-metric', {
                    filters: allFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            formatValue: formatPercent,
            unit: '%'
        },
        PRECISION: {
            fetchData: () => {

                return metricsClient('precision-metric', {
                    filters: allFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            formatValue: formatPercent,
            unit: '%'
        },
        RECALL: {
            fetchData: () => {

                return metricsClient('recall-metric', {
                    filters: allFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            formatValue: formatPercent,
            unit: '%'
        },
        F1_SCORE: {
            fetchData: () => {

                return metricsClient('f1-score-metric', {
                    filters: allFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            formatValue: formatPercent,
            unit: '%'
        },
        WORD_ERROR_RATE: {
            fetchData: () => {

                return metricsClient('word-error-rate', {
                    sql_filters: allSqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            formatValue: formatPercent,
            unit: '%'
        },
        EXACT_MATCH: {
            fetchData: () => {

                return metricsClient('exact-match', {
                    sql_filters: allSqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            formatValue: formatPercent,
            unit: '%'
        },
        SEMANTIC_SIMILARITY: {
            fetchData: () => {

                return metricsClient('semantic-similarity', {
                    sql_filters: allSqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            formatValue: formatPercent,
            unit: '%'
        },
        MAP: {
            fetchData: () => {

                return metricsClient('map', {
                    sql_filters: allSqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType,
                    iou_threshold: 0.5
                });
            },
            formatValue: formatPercent,
            unit: '%',
            name: 'Mean Average Precision'
        },
        MAR: {
            fetchData: () => {

                return metricsClient('mar', {
                    sql_filters: allSqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType,
                    iou_threshold: 0.5
                });
            },
            formatValue: formatPercent,
            unit: '%',
            name: 'Mean Average Recall'
        },
        CONFIDENCE: {
            fetchData: () => {

                return metricsClient('confidence', {
                    filters: allFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            formatValue: formatPercent,
            unit: '%'
        },
        ENTROPY: {
            fetchData: () => {
                return metricsClient('entropy', {
                    filters: allFilters,
                    time_granularity: timeGranularity
                });
            },
            formatValue: formatPercent,
            unit: '%'
        },
        COSINE_PEARSON_CORRELATION: {
            fetchData: () => {

                return metricsClient('pearson-cosine', {
                    sql_filters: allSqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            formatValue: formatPercent,
            unit: '%'
        },
        COSINE_SPEARMAN_CORRELATION: {
            fetchData: () => {

                return metricsClient('spearman-cosine', {
                    sql_filters: allSqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            formatValue: formatPercent,
            unit: '%'
        },
        MRR: {
            fetchData: () => {

                return metricsClient('mrr', {
                    filters: allFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            formatValue: formatNumber,
            name: 'MRR'
        },
        MEAN_NDCG: {
            fetchData: () => {

                return metricsClient('mean-ndcg', {
                    filters: allFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            formatValue: formatPercent,
            unit: '%',
            name: 'Mean NDCG'
        },
        BLUR: {
            fetchData: () => {

                return metricsClient('metadata-metric', {
                    metric: 'blur',
                    filters: allFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            formatValue: formatNumber
        },
        BRIGHTNESS: {
            fetchData: () => {

                return metricsClient('metadata-metric', {
                    metric: 'brightness',
                    filters: allFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            },
            formatValue: formatPercent,
            unit: '%'
        }
    }[metric];

    if (result) {

        return result;
    } else {

        throw new Error(`No metric defined: "${metric}"`);
    }
};

export default MetricChart;
