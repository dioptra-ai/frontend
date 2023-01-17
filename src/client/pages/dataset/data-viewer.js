import PropTypes from 'prop-types';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import Async from 'components/async';
import DatapointsViewer from 'components/datapoints-viewer';
import baseJSONClient from 'clients/base-json-client';
import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';

const DataViewer = ({datapointIds, ...rest}) => {

    return (
        <>
            <Async
                fetchData={() => baseJSONClient('/api/datapoints/_legacy-get-groundtruth-prediction-events', {
                    method: 'post',
                    body: {datapointIds}
                })}
                refetchOnChanged={[datapointIds]}
                renderData={(events) => {
                    const groundtruths = events.reduce((acc, {groundtruth}) => {
                        if (!groundtruth) {
                            return acc;
                        } else {
                            const className = groundtruth['class_name'];

                            if (!acc[className]) {
                                acc[className] = 0;
                            }
                            acc[className] += 1;

                            return acc;
                        }
                    }, {});
                    const predictions = events.reduce((acc, {prediction}) => {
                        if (!prediction) {
                            return acc;
                        } else {
                            const className = prediction['class_name'];

                            if (!acc[className]) {
                                acc[className] = 0;
                            }
                            acc[className] += 1;

                            return acc;
                        }
                    }, {});

                    return (
                        <Row className='g-2 my-2'>
                            {
                                Object.keys(groundtruths).length ? (

                                    <Col>
                                        <BarGraph
                                            title='Groundtruths'
                                            bars={Object.entries(groundtruths).map(([name, value]) => ({
                                                name,
                                                value,
                                                fill: getHexColor(name)
                                            }))}
                                        />
                                    </Col>
                                ) : null
                            }
                            {
                                Object.keys(predictions).length ? (
                                    <Col>
                                        <BarGraph
                                            title='Predictions'
                                            bars={Object.entries(predictions).map(([name, value]) => ({
                                                name,
                                                value,
                                                fill: getHexColor(name)
                                            }))}
                                        />
                                    </Col>
                                ) : null
                            }
                        </Row>
                    );
                }}
            />
            <Row className='g-1'>
                <Col>
                    <Async
                        fetchData={() => baseJSONClient('/api/datapoints/_legacy-get-datapoint-events', {
                            method: 'post',
                            body: {datapointIds}
                        })}
                        renderData={(events) => (
                            <DatapointsViewer datapoints={events} {...rest} />
                        )}
                        refetchOnChanged={[datapointIds]}
                    />
                </Col>
            </Row>
        </>
    );
};

DataViewer.propTypes = {
    datapointIds: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default DataViewer;
