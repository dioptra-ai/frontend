/* eslint-disable max-lines */
import metricsClient from 'clients/metrics';
import AreaGraph from 'components/area-graph';
import Async from 'components/async';
import MetricInfoBox from 'components/metric-info-box';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import useModel from 'hooks/use-model';
import {setupComponent} from 'helpers/component-helper';
import PropTypes from 'prop-types';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import CountEvents from 'components/count-events';
import useTimeGranularity from 'hooks/use-time-granularity';
import CorrelationToKPIs from 'pages/common/correlation-to-kpis';

const ModelPerformanceMetrics = {
    F1_SCORE: {value: 'F1_SCORE', name: 'F1 Score'},
    EXACT_MATCH: {value: 'EXACT_MATCH', name: 'Exact Match'},
    SEMANTIC_SIMILARITY: {value: 'SEMANTIC_SIMILARITY', name: 'Semantic Similarity'}
};

const PerformanceOverview = ({timeStore}) => {
    const allSqlFilters = useAllSqlFilters({
        __REMOVE_ME__excludeOrgId: true
    });
    const model = useModel();

    const sampleSizeComponent = (<CountEvents sqlFilters={allSqlFilters}/>);
    const timeGranularity = useTimeGranularity()?.toISOString();

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
            [ModelPerformanceMetrics.SEMANTIC_SIMILARITY.value]: () => {

                return metricsClient('semantic-similarity', {
                    sql_filters: sqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
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
                <CorrelationToKPIs selectableMetrics={[
                    {value: 'EXACT_MATCH', name: 'Exact Match'},
                    {value: 'F1_SCORE', name: 'F1 Score'},
                    {value: 'SEMANTIC_SIMILARITY', name: 'Semantic Similarity'}
                ]}/>
            </div>
        </>
    );
};

PerformanceOverview.propTypes = {
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(PerformanceOverview);
