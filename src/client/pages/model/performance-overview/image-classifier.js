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
import CorrelationToKPIs from 'pages/common/correlation-to-kpis';

const ModelPerformanceMetrics = {
    ACCURACY: {value: 'ACCURACY', name: 'Accuracy'},
    F1_SCORE: {value: 'F1_SCORE', name: 'F1 Score'},
    PRECISION: {value: 'PRECISION', name: 'Precision'},
    RECALL: {value: 'RECALL', name: 'Recall'}
};

const PerformanceOverview = ({timeStore}) => {
    const allSqlFilters = useAllSqlFilters({
        __REMOVE_ME__excludeOrgId: true
    });
    const sqlFiltersWithModelTime = useAllSqlFilters({
        useReferenceRange: true,
        __REMOVE_ME__excludeOrgId: true
    });
    const model = useModel();
    const sampleSizeComponent = (<CountEvents sqlFilters={allSqlFilters}/>);

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
                <CorrelationToKPIs selectableMetrics={[
                    {value: 'ACCURACY', name: 'Accuracy'},
                    {value: 'F1_SCORE', name: 'F1 Score'},
                    {value: 'PRECISION', name: 'Precision'},
                    {value: 'RECALL', name: 'Recall'}
                ]}/>
            </div>
        </>
    );
};

PerformanceOverview.propTypes = {
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(PerformanceOverview);
