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
                                    name='Exact Match'
                                    subtext={sampleSizeComponent}
                                    unit='%'
                                    value={100 * data?.value}
                                    difference={100 * (data?.value - benchmarkData?.value)}
                                />
                            )}
                            fetchData={[
                                () => metricsClient('exact-match', {
                                    sql_filters: allSqlFilters,
                                    model_type: 'SPEECH_TO_TEXT'
                                }),
                                () => metricsClient('exact-match', {
                                    sql_filters: sqlFiltersWithModelTime,
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
                                    name='Word Error Rate'
                                    subtext={sampleSizeComponent}
                                    unit='%'
                                    value={100 * data?.value}
                                    difference={100 * (data?.value - benchmarkData?.value)}
                                />
                            )}
                            fetchData={[
                                () => metricsClient('word-error-rate', {
                                    sql_filters: allSqlFilters,
                                    model_type: 'SPEECH_TO_TEXT'
                                }),
                                () => metricsClient('word-error-rate', {
                                    sql_filters: sqlFiltersWithModelTime,
                                    model_type: 'SPEECH_TO_TEXT'
                                })
                            ]}
                            refetchOnChanged={[allSqlFilters, sqlFiltersWithModelTime]}
                        />
                    </Col>
                </Row>
                <CorrelationToKPIs selectableMetrics={[
                    {value: 'EXACT_MATCH', name: 'Exact Match'},
                    {value: 'WORD_ERROR_RATE', name: 'Word Error Rate'}
                ]}/>
            </div>
        </>
    );
};

export default PerformanceOverview;
