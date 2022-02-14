import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ConfusionMatrix from 'components/confusion-matrix';
import Segmentation from 'pages/common/segmentation';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import useModel from 'hooks/use-model';
import MetricInfoBox from 'components/metric-info-box';
import BarGraph from 'components/bar-graph';
import {getName} from 'helpers/name-helper';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import CountEvents from 'components/count-events';
import {getHexColor} from 'helpers/color-helper';
import PerformancePerClass from 'pages/common/performance-per-class';

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
                                bars={data.map(({groundtruth, my_percentage}) => ({
                                    name: getName(groundtruth),
                                    value: my_percentage,
                                    fill: getHexColor(groundtruth)
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
        </div>
    );
};

export default PerformanceDetails;
