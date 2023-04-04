import PropTypes from 'prop-types';
import {Col, Row} from 'react-bootstrap';

import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';
import Async from 'components/async';
import baseJSONClient from 'clients/base-json-client';

const Metrics = ({filters, datasetId}) => {

    if (!datasetId) {
        return null;
    }

    return (
        <Row className='g-2 my-2'>
            <Col>
                <Async fetchData={async () => {
                    const datapoints = await baseJSONClient.post('/api/datapoints/select', {
                        filters, datasetId, selectColumns: ['id']
                    });

                    return baseJSONClient.post('/api/metrics/distribution/groundtruths', {
                        datapoint_ids: datapoints.map((datapoint) => datapoint.id)
                    });
                }}
                refetchOnChanged={[filters, datasetId]}
                renderData={(groundtruthDistribution) => groundtruthDistribution.histogram && Object.keys(groundtruthDistribution.histogram).length ? (
                    <Col>
                        <BarGraph
                            title='Groundtruths'
                            bars={Object.entries(groundtruthDistribution.histogram).map(([name, value]) => ({
                                name, value, fill: getHexColor(name)
                            }))}
                            yAxisTickFormatter={(v) => Number(v).toLocaleString()}
                        />
                    </Col>
                ) : null
                }/>
            </Col>
        </Row>
    );
};

Metrics.propTypes = {
    filters: PropTypes.array,
    datasetId: PropTypes.string
};

export default Metrics;
