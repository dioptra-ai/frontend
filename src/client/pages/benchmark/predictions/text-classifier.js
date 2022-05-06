import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Async from 'components/async';
import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';
import metricsClient from 'clients/metrics';
import useAllSqlFilters from 'hooks/use-all-sql-filters';

const TextClassifier = () => {
    const allSqlFilters = useAllSqlFilters();

    return (
        <div className='my-3'>
            <Row className='my-3'>
                <Col className='d-flex' lg={6}>
                    <Async
                        refetchOnChanged={[allSqlFilters]}
                        renderData={(data) => (
                            <BarGraph
                                bars={data.map(({prediction, my_percentage}) => ({
                                    name: prediction,
                                    value: my_percentage,
                                    fill: getHexColor(prediction)
                                }))}
                                title='Online Class Distribution'
                                unit='%'
                            />
                        )}
                        fetchData={() => metricsClient('queries/class-distribution-1', {sql_filters: allSqlFilters})}
                    />
                </Col>
                <Col lg={6}>
                    <Async
                        refetchOnChanged={[allSqlFilters]}
                        renderData={(data) => (
                            <BarGraph
                                bars={data.map(({groundtruth, my_percentage}) => ({
                                    name: groundtruth,
                                    value: my_percentage,
                                    fill: getHexColor(groundtruth)
                                }))}
                                title='Groundtruth Distribution'
                                unit='%'
                            />
                        )}
                        fetchData={() => metricsClient('gt-distribution', {
                            sql_filters: allSqlFilters,
                            model_type: 'TEXT_CLASSIFIER'
                        })}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default TextClassifier;
