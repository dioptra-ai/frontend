/* eslint-disable max-lines */
import metricsClient from 'clients/metrics';
import Async from 'components/async';
import MetricInfoBox from 'components/metric-info-box';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import CountEvents from 'components/count-events';
import Throughput from 'pages/common/throughput';

const MultipleObjectTracking = () => {
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
                            fetchData={() => metricsClient('mota', {
                                sql_filters: allSqlFilters,
                                model_type: 'MULTIPLE_OBJECT_TRACKING'
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='MOTA'
                                    subtext={sampleSizeComponent}
                                    unit='%'
                                    value={100 * d?.value}
                                    info='Multiple Object Tracking Accuracy'
                                />
                            )}
                        />
                    </Col>
                    <Col className='d-flex' lg={3}>
                        <Async
                            fetchData={() => metricsClient('mostly-tracked', {
                                sql_filters: allSqlFilters,
                                model_type: 'MULTIPLE_OBJECT_TRACKING'
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='Mostly Tracked'
                                    subtext={sampleSizeComponent}
                                    unit='%'
                                    value={100 * d?.value}
                                    info='Tracks detected >= 80%'
                                />
                            )}
                        />
                    </Col>
                    <Col className='d-flex' lg={3}>
                        <Async
                            fetchData={() => metricsClient('mostly-lost', {
                                sql_filters: allSqlFilters,
                                model_type: 'MULTIPLE_OBJECT_TRACKING'
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='Mostly Lost'
                                    subtext={sampleSizeComponent}
                                    unit='%'
                                    value={100 * d?.value}
                                    info='Tracks detected < 20%'
                                />
                            )}
                        />
                    </Col>
                    <Col className='d-flex' lg={3}>
                        <Async
                            fetchData={() => metricsClient('id-switches', {
                                sql_filters: allSqlFilters,
                                model_type: 'MULTIPLE_OBJECT_TRACKING'
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='ID Switches per Track'
                                    subtext={sampleSizeComponent}
                                    value={d?.value}
                                    info='ID switches per detected tracks'
                                />
                            )}
                        />
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default MultipleObjectTracking;
