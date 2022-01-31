/* eslint-disable max-lines */
import metricsClient from 'clients/metrics';
import Async from 'components/async';
import MetricInfoBox from 'components/metric-info-box';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import CountEvents from 'components/count-events';
import CorrelationToKPIs from 'pages/common/correlation-to-kpis';
import Throughput from 'pages/common/throughput';

const PerformanceOverview = () => {
    const allSqlFilters = useAllSqlFilters({
        __REMOVE_ME__excludeOrgId: true
    });
    const sqlFiltersWithModelTime = useAllSqlFilters({
        useReferenceRange: true,
        __REMOVE_ME__excludeOrgId: true
    });
    const sampleSizeComponent = (<CountEvents sqlFilters={allSqlFilters}/>);

    return (
        <>
            <div className='my-2'>
                <Throughput sqlFilters={allSqlFilters}/>
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
                                () => metricsClient('accuracy-metric', {
                                    sql_filters: allSqlFilters,
                                    model_type: 'SPEECH_TO_TEXT'
                                }),
                                () => metricsClient('accuracy-metric', {
                                    sql_filters: allSqlFilters,
                                    model_type: 'SPEECH_TO_TEXT'
                                })
                            ]}
                            refetchOnChanged={[allSqlFilters, sqlFiltersWithModelTime]}
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
                                () => metricsClient('f1-score-metric', {
                                    sql_filters: allSqlFilters,
                                    model_type: 'SPEECH_TO_TEXT'
                                }),
                                () => metricsClient('f1-score-metric', {
                                    sql_filters: allSqlFilters,
                                    model_type: 'SPEECH_TO_TEXT'
                                })
                            ]}
                            refetchOnChanged={[allSqlFilters, sqlFiltersWithModelTime]}
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
                                () => metricsClient('recall-metric', {
                                    sql_filters: allSqlFilters,
                                    model_type: 'SPEECH_TO_TEXT'
                                }),
                                () => metricsClient('recall-metric', {
                                    sql_filters: allSqlFilters,
                                    model_type: 'SPEECH_TO_TEXT'
                                })
                            ]}
                            refetchOnChanged={[allSqlFilters, sqlFiltersWithModelTime]}
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
                                () => metricsClient('precision-metric', {
                                    sql_filters: allSqlFilters,
                                    model_type: 'SPEECH_TO_TEXT'
                                }),
                                () => metricsClient('precision-metric', {
                                    sql_filters: allSqlFilters,
                                    model_type: 'SPEECH_TO_TEXT'
                                })
                            ]}
                            refetchOnChanged={[allSqlFilters, sqlFiltersWithModelTime]}
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

export default PerformanceOverview;
