import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import MetricInfoBox from 'components/metric-info-box';
import PerformanceClustersAnalysis from 'pages/common/performance-clusters-analysis';
import CountEvents from 'components/count-events';

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
            <PerformanceClustersAnalysis/>
        </div>
    );
};

export default PerformanceDetails;
