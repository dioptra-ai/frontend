import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ConfusionMatrix from 'components/confusion-matrix';
import Segmentation from 'pages/common/segmentation';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import MetricInfoBox from 'components/metric-info-box';
import CountEvents from 'components/count-events';
import PerformancePerClass from 'pages/common/performance-per-class';

const PerformanceDetails = () => {
    const allSqlFilters = useAllSqlFilters();
    const sampleSizeComponent = <CountEvents sqlFilters={allSqlFilters}/>;

    return (
        <div className='pb-5'>
            <div className='my-3'>
                <Row className='align-items-stretch'>
                    <Col className='d-flex' lg={3}>
                        <MetricInfoBox name='Datapoints'>{sampleSizeComponent}</MetricInfoBox>
                    </Col>
                </Row>
            </div>
            <div className='my-3'>
                <PerformancePerClass/>
            </div>
            <ConfusionMatrix />
            <Segmentation />
        </div>
    );
};

export default PerformanceDetails;
