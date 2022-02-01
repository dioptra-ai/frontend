import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ConfusionMatrix from 'components/confusion-matrix';
import Segmentation from 'pages/common/segmentation';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import MetricInfoBox from 'components/metric-info-box';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import CountEvents from 'components/count-events';
import MapMarAnalysis from 'pages/common/map-mar-analysis';

const PerformanceDetails = () => {
    const allSqlFilters = useAllSqlFilters();
    const sampleSizeComponent = <CountEvents sqlFilters={allSqlFilters}/>;

    return (
        <div className='pb-5'>
            <div className='my-3'>
                <Row className='mb-3 align-items-stretch'>
                    <Col className='d-flex' lg={3}>
                        <MetricInfoBox name='Datapoints'>{sampleSizeComponent}</MetricInfoBox>
                    </Col>
                </Row>
            </div>
            <div className='my-3'>
                <Row className='mb-3 align-items-stretch'>
                    <Col className='d-flex' lg={2}>
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
                    <Col className='d-flex' lg={2}>
                        <Async
                            fetchData={() => metricsClient('map', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.75
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='mAP'
                                    subtext='iou=0.75'
                                    value={d?.value}
                                />
                            )}
                        />
                    </Col>
                    <Col className='d-flex' lg={2}>
                        <Async
                            fetchData={() => metricsClient('map', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.95
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='mAP'
                                    subtext='iou=0.95'
                                    value={d?.value}
                                />
                            )}
                        />
                    </Col>
                    <Col className='d-flex' lg={2}>
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
                    <Col className='d-flex' lg={2}>
                        <Async
                            fetchData={() => metricsClient('mar', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.75
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='mAR'
                                    subtext='iou=0.75'
                                    value={d?.value}
                                />
                            )}
                        />
                    </Col>
                    <Col className='d-flex' lg={2}>
                        <Async
                            fetchData={() => metricsClient('mar', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.95
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='mAR'
                                    subtext='iou=0.95'
                                    value={d?.value}
                                />
                            )}
                        />
                    </Col>
                </Row>
            </div>

            <div className='my-3'>
                <MapMarAnalysis/>
            </div>
            <ConfusionMatrix />
            <Segmentation />
        </div>
    );
};

export default PerformanceDetails;
