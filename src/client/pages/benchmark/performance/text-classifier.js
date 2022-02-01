import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import useModel from 'hooks/use-model';
import MetricInfoBox from 'components/metric-info-box';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import CountEvents from 'components/count-events';
import PerformancePerClass from 'pages/common/performance-per-class';

const TextClassifier = ({benchmarkFilters}) => {
    const allSqlFilters = useAllSqlFilters();
    const {mlModelType} = useModel();
    const sampleSizeComponent = <CountEvents sqlFilters={allSqlFilters}/>;
    const liveModelFilters = useAllSqlFilters({forLiveModel: true});

    return (
        <div className='pb-5'>
            <div className='my-3'>
                <Row className='mb-3 align-items-stretch'>
                    <Col className='d-flex' lg={2}>
                        <MetricInfoBox
                            name='Datapoints'
                        >
                            {sampleSizeComponent}
                        </MetricInfoBox>
                    </Col>
                    <Col className='d-flex' lg={2}>
                        <Async
                            fetchData={() => metricsClient('compute', {
                                metrics_type: 'outlier_detection',
                                current_filters: allSqlFilters,
                                reference_filters: liveModelFilters,
                                model_type: mlModelType
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={(data) => {
                                const noveltyNum = data?.outlier_analysis?.filter((d) => d.novelty).length;

                                return (
                                    <MetricInfoBox
                                        name='Obsolete'
                                        value={100 * noveltyNum / data?.outlier_analysis.length}
                                        unit='%'
                                        info='As of the last 24h of the model and version.'
                                    />
                                );
                            }}
                        />
                    </Col>
                    <Col className='d-flex' lg={2}>
                        <Async
                            fetchData={[
                                () => metricsClient('accuracy-metric', {
                                    sql_filters: allSqlFilters,
                                    model_type: mlModelType
                                }),
                                () => benchmarkFilters ? metricsClient('accuracy-metric', {
                                    sql_filters: benchmarkFilters,
                                    model_type: mlModelType
                                }) : null
                            ]}
                            refetchOnChanged={[allSqlFilters, benchmarkFilters]}
                            renderData={([d, b]) => {
                                const value = d?.[0]?.value;
                                const benchmarkValue = b?.[0]?.value;

                                return (
                                    <MetricInfoBox name='Accuracy'>
                                        {Number(value).toFixed(2)}
                                        {benchmarkValue ? (
                                            <span className='fs-1 text-secondary'>
                                                {` | ${Number(benchmarkValue).toFixed(2)}`}
                                            </span>) : null
                                        }
                                    </MetricInfoBox>
                                );
                            }}
                        />
                    </Col>
                    <Col className='d-flex' lg={2}>
                        <Async
                            fetchData={[
                                () => metricsClient('f1-score-metric', {
                                    sql_filters: allSqlFilters,
                                    model_type: mlModelType
                                }),
                                () => benchmarkFilters ? metricsClient('f1-score-metric', {
                                    sql_filters: benchmarkFilters,
                                    model_type: mlModelType
                                }) : null
                            ]}
                            refetchOnChanged={[allSqlFilters, benchmarkFilters]}
                            renderData={([d, b]) => {
                                const value = d?.[0]?.value;
                                const benchmarkValue = b?.[0]?.value;

                                return (
                                    <MetricInfoBox name='F1 Score'>
                                        {Number(value).toFixed(2)}
                                        {benchmarkValue ? (
                                            <span className='fs-1 text-secondary'>
                                                {` | ${Number(benchmarkValue).toFixed(2)}`}
                                            </span>) : null
                                        }
                                    </MetricInfoBox>
                                );
                            }}
                        />
                    </Col>
                    <Col className='d-flex' lg={2}>
                        <Async
                            fetchData={[
                                () => metricsClient('precision-metric', {
                                    sql_filters: allSqlFilters,
                                    model_type: mlModelType
                                }),
                                () => benchmarkFilters ? metricsClient('precision-metric', {
                                    sql_filters: benchmarkFilters,
                                    model_type: mlModelType
                                }) : null
                            ]}
                            refetchOnChanged={[allSqlFilters, benchmarkFilters]}
                            renderData={([d, b]) => {
                                const value = d?.[0]?.value;
                                const benchmarkValue = b?.[0]?.value;

                                return (
                                    <MetricInfoBox name='Precision'>
                                        {Number(value).toFixed(2)}
                                        {benchmarkValue ? (
                                            <span className='fs-1 text-secondary'>
                                                {` | ${Number(benchmarkValue).toFixed(2)}`}
                                            </span>) : null
                                        }
                                    </MetricInfoBox>
                                );
                            }}
                        />
                    </Col>
                    <Col className='d-flex' lg={2}>
                        <Async
                            fetchData={[
                                () => metricsClient('recall-metric', {
                                    sql_filters: allSqlFilters,
                                    model_type: mlModelType
                                }),
                                () => benchmarkFilters ? metricsClient('recall-metric', {
                                    sql_filters: benchmarkFilters,
                                    model_type: mlModelType
                                }) : null
                            ]}
                            refetchOnChanged={[allSqlFilters, benchmarkFilters]}
                            renderData={([d, b]) => {
                                const value = d?.[0]?.value;
                                const benchmarkValue = b?.[0]?.value;

                                return (
                                    <MetricInfoBox name='Recall'>
                                        {Number(value).toFixed(2)}
                                        {benchmarkValue ? (
                                            <span className='fs-1 text-secondary'>
                                                {` | ${Number(benchmarkValue).toFixed(2)}`}
                                            </span>) : null
                                        }
                                    </MetricInfoBox>
                                );
                            }}
                        />
                    </Col>
                </Row>
            </div>
            <div className='my-3'>
                <PerformancePerClass/>
            </div>
        </div>
    );
};

TextClassifier.propTypes = {
    benchmarkFilters: PropTypes.string
};

export default TextClassifier;
