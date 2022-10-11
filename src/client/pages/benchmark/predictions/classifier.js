import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Async from 'components/async';
import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';
import metricsClient from 'clients/metrics';
import useAllFilters from 'hooks/use-all-filters';
import useModel from 'hooks/use-model';

const Classifier = () => {
    const allFilters = useAllFilters();
    const model = useModel();

    return (
        <div className='my-3'>
            <Row className='my-3'>
                <Col className='d-flex' lg={6}>
                    <Async
                        refetchOnChanged={[allFilters]}
                        renderData={(data) => (
                            <BarGraph
                                bars={data.map(({name, value}) => ({
                                    name,
                                    value,
                                    fill: getHexColor(name)
                                }))}
                                title='Predicted Class Distribution'
                                unit='%'
                            />
                        )}
                        fetchData={() => metricsClient('queries/class-distribution', {
                            filters: allFilters,
                            distribution_field: 'prediction'
                        })}
                    />
                </Col>
                {(model.mlModelType === 'UNSUPERVISED_TEXT_CLASSIFIER' || model.mlModelType === 'UNSUPERVISED_IMAGE_CLASSIFIER') ? (
                    null
                ) : (
                    <Col lg={6}>
                        <Async
                            refetchOnChanged={[allFilters]}
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
                            fetchData={() => metricsClient('queries/class-distribution', {
                                filters: allFilters,
                                distribution_field: 'groundtruth'
                            })}
                        />
                    </Col>
                )}
            </Row>
        </div>
    );
};

export default Classifier;
