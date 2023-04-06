import PropTypes from 'prop-types';
import {Col, Row} from 'react-bootstrap';

import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';
import Async from 'components/async';
import baseJSONClient from 'clients/base-json-client';

const Metrics = ({filters, datasetId}) => {

    return (
        <Row className='g-2 my-2'>
            <Col>
                <Async fetchData={async () => {
                    const datapoints = await baseJSONClient.post('/api/datapoints/select', {
                        filters, datasetId, selectColumns: ['id']
                    });

                    return baseJSONClient.post('/api/metrics/distribution/groundtruths', {
                        filters: [{
                            left: 'datapoint',
                            op: 'in',
                            right: datapoints.map((datapoint) => datapoint.id)
                        }]
                    });
                }}
                refetchOnChanged={[filters, datasetId]}
                renderData={(groundtruthDistribution) => groundtruthDistribution.histogram && Object.keys(groundtruthDistribution.histogram).length ? (
                    <BarGraph
                        title='Groundtruths'
                        verticalIfMoreThan={10}
                        bars={Object.entries(groundtruthDistribution.histogram).map(([name, value]) => ({
                            name, value, fill: getHexColor(name)
                        }))}
                    />
                ) : null
                } />
            </Col>
        </Row>
    );
};

Metrics.propTypes = {
    filters: PropTypes.array,
    datasetId: PropTypes.string.isRequired
};

export default Metrics;
