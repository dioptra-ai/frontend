import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Segmentation from 'pages/common/segmentation';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import MetricInfoBox from 'components/metric-info-box';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import CountEvents from 'components/count-events';
import useTimeGranularity from 'hooks/use-time-granularity';

const PerformanceDetails = () => {
    const allSqlFilters = useAllSqlFilters();
    const sampleSizeComponent = <CountEvents sqlFilters={allSqlFilters}/>;
    const timeGranularity = useTimeGranularity()?.toISOString();

    return (
        <div className='pb-5'>
            <div className='my-3'>
                <Row className='mb-3 align-items-stretch'>
                    <Col className='d-flex' lg={3}>
                        <MetricInfoBox name='Datapoints'>{sampleSizeComponent}</MetricInfoBox>
                    </Col>
                    <Col className='d-flex' lg={3}>
                        <Async
                            fetchData={() => metricsClient('exact-match', {
                                sql_filters: allSqlFilters,
                                time_granularity: timeGranularity,
                                model_type: 'SPEECH_TO_TEXT'
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
                    <Col className='d-flex' lg={3}>
                        <Async
                            fetchData={() => metricsClient('word-error-rate', {
                                sql_filters: allSqlFilters,
                                time_granularity: timeGranularity,
                                model_type: 'SPEECH_TO_TEXT'
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='WER'
                                    value={d?.value}
                                />
                            )}
                        />
                    </Col>
                </Row>
            </div>
            <Segmentation />
        </div>
    );
};

export default PerformanceDetails;
