import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import metricsClient from 'clients/metrics';
import Async from 'components/async';
import MetricInfoBox from 'components/metric-info-box';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import CorrelationToKPIs from 'pages/common/correlation-to-kpis';
import Throughput from 'pages/common/throughput';

const PerformanceOverview = () => {
    const allSqlFilters = useAllSqlFilters({
        __REMOVE_ME__excludeOrgId: true
    });

    return (
        <>
            <div className='my-2'>
                <Throughput sqlFilters={allSqlFilters}/>
            </div>
            <div className='my-3'>

                <Row className='mb-3 align-items-stretch'>
                    <Col className='d-flex' lg={3}>
                        <Async
                            fetchData={() => metricsClient('map', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.5
                            })}
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
                            fetchData={() => metricsClient('mar', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.5
                            })}
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
                            fetchData={() => metricsClient('exact-match', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING'
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='EM'
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

export default PerformanceOverview;
