/* eslint-disable max-lines */
import metricsClient from 'clients/metrics';
import AreaGraph from 'components/area-graph';
import Async from 'components/async';
import MetricInfoBox from 'components/metric-info-box';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import useModel from 'hooks/use-model';
import {setupComponent} from 'helpers/component-helper';
import PropTypes from 'prop-types';
import {useState} from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import CorrelationToKPIs from 'pages/common/correlation-to-kpis';

const ModelPerformanceMetrics = {
    F1_SCORE: {value: 'F1_SCORE', name: 'F1 Score'},
    EXACT_MATCH: {value: 'EXACT_MATCH', name: 'Exact Match'},
    MEAN_AVERAGE_PRECISION: {value: 'MEAN_AVERAGE_PRECISION', name: 'mAP'},
    MEAN_AVERAGE_RECALL: {value: 'MEAN_AVERAGE_RECALL', name: 'mAR'}
};

const PerformanceOverview = ({timeStore}) => {
    const allSqlFilters = useAllSqlFilters({
        __REMOVE_ME__excludeOrgId: true
    });
    const model = useModel();
    const [iou] = useState(0.5);
    const getQueryForMetric = (metricName, timeGranularity, sqlFilters = allSqlFilters) => {

        return {
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
                <CorrelationToKPIs selectableMetrics={[
                    {value: 'MEAN_AVERAGE_PRECISION', name: 'mAP'},
                    {value: 'MEAN_AVERAGE_RECALL', name: 'mAR'},
                    {value: 'EXACT_MATCH', name: 'Exact Match'},
                    {value: 'F1_SCORE', name: 'F1 Score'}
                ]}/>
            </div>
        </>
    );
};

PerformanceOverview.propTypes = {
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(PerformanceOverview);
