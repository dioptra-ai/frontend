import {useParams} from 'react-router-dom';
import PropTypes from 'prop-types';

import baseJSONClient from 'clients/base-json-client';
import Async from 'components/async';
import Menu from 'components/menu';
import TopBar from 'pages/common/top-bar';
import {Col, Row} from 'react-bootstrap';

const DatasetDiff = () => {
    const {versionId1, versionId2} = useParams();

    return (
        <Menu>
            <TopBar hideTimePicker />
            <Async
                fetchData={() => baseJSONClient(`/api/dataset/diff/${versionId1}/${versionId2}`)}
                renderData={({added, removed}) => (
                    <Row>
                        <Col>
                            <h3 style={{color: 'green'}}>Added</h3>
                            <Async
                                fetchData={() => baseJSONClient('/api/datapoints/_legacy-get-events', {
                                    method: 'post',
                                    body: {datapointIds: added}
                                })}
                                renderData={(events) => (
                                    <pre>{JSON.stringify(events, null, 2)}</pre>
                                )}
                                refetchOnChanged={[added]}
                            />
                        </Col>
                        <Col>
                            <h3 style={{color: 'red'}}>Removed</h3>
                            <Async
                                fetchData={() => baseJSONClient('/api/datapoints/_legacy-get-events', {
                                    method: 'post',
                                    body: {datapointIds: removed}
                                })}
                                renderData={(events) => (
                                    <pre>{JSON.stringify(events, null, 2)}</pre>
                                )}
                                refetchOnChanged={[added]}
                            />
                        </Col>
                    </Row>
                )}
            />
        </Menu>
    );
};

DatasetDiff.propTypes = {
    versionId1: PropTypes.string.isRequired,
    versionId2: PropTypes.string.isRequired
};

export default DatasetDiff;
