import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Async from 'components/async';
import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';
import {getName} from 'helpers/name-helper';
import metricsClient from 'clients/metrics';
import useAllSqlFilters from 'hooks/use-all-sql-filters';

const TextClassifier = () => {
    const allSqlFilters = useAllSqlFilters();

    return (
        <div className='my-3'>
            <Row className='my-3'>
                <Col className='d-flex'>
                    <Async
                        refetchOnChanged={[allSqlFilters]}
                        renderData={(data) => (
                            <BarGraph
                                bars={data.map(({prediction, my_percentage}) => ({
                                    name: getName(prediction),
                                    value: my_percentage,
                                    fill: getHexColor(prediction)
                                }))}
                                title='Online Class Distribution'
                                unit='%'
                            />
                        )}
                        fetchData={() => metricsClient('queries/online-class-distribution-2', {sql_filters: allSqlFilters})}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default TextClassifier;
