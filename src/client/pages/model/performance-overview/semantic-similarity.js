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
                            fetchData={() => metricsClient('pearson-cosine', {
                                sql_filters: allSqlFilters,
                                model_type: 'SEMANTIC_SIMILARITY'
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='Cosine Pearson Correlation'
                                    subtext={sampleSizeComponent}
                                    unit='%'
                                    value={100 * d?.value}
                                />
                            )}
                        />
                    </Col>
                    <Col className='d-flex' lg={3}>
                        <Async
                            fetchData={() => metricsClient('spearman-cosine', {
                                sql_filters: allSqlFilters,
                                model_type: 'SEMANTIC_SIMILARITY'
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='Cosine Spearman Correlation'
                                    subtext={sampleSizeComponent}
                                    unit='%'
                                    value={100 * d?.value}
                                />
                            )}
                        />
                    </Col>
                </Row>
                <CorrelationToKPIs selectableMetrics={[
                    {value: 'COSINE_PEARSON_CORRELATION', name: 'Cosine Pearson Correlation'},
                    {value: 'COSINE_SPEARMAN_CORRELATION', name: 'Cosine Spearman Correlation'}
                ]}/>
            </div>
        </>
    );
};

export default PerformanceOverview;
