import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ConfusionMatrix from 'components/confusion-matrix';
import Segmentation from 'pages/common/segmentation';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import MetricInfoBox from 'components/metric-info-box';
import CountEvents from 'components/count-events';
import PerformancePerClass from 'pages/common/performance-per-class';
import Async from 'components/async';
import BarGraph from 'components/bar-graph';
import metricsClient from 'clients/metrics';
import {getHexColor} from 'helpers/color-helper';
import useModel from 'hooks/use-model';

const PerformanceDetails = () => {
    const allSqlFilters = useAllSqlFilters();
    const {mlModelType} = useModel();
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
            <Row>
                <Col>
                    <Async
                        refetchOnChanged={[allSqlFilters]}
                        renderData={(data) => (
                            <BarGraph
                                bars={data.map((result) => ({
                                    name: result.name,
                                    value: result.value,
                                    fill: getHexColor(result.name)
                                }))}
                                title='Groundtruth Distribution'
                                unit='%'
                            />
                        )}
                        fetchData={() => metricsClient('gt-distribution', {
                            sql_filters: allSqlFilters,
                            model_type: mlModelType
                        })}
                    />
                </Col>
            </Row>
            <div className='my-3'>
                <PerformancePerClass/>
            </div>
            <ConfusionMatrix />
            <Segmentation />
        </div>
    );
};

export default PerformanceDetails;
