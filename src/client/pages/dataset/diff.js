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
                renderData={({added, removed, version1, version2}) => (
                    <div className='bg-white-blue text-dark p-3'>
                        <Row>
                            <Col>
                                <h4>Version 1</h4>
                                <pre>{version1['committed'] ? version1['message'] : '<Uncomitted>'}</pre>
                            </Col>
                            <Col xs={1}>
                                <span className='fs-2'>{'->'}</span>
                            </Col>
                            <Col>
                                <h4>Version 2</h4>
                                <pre>{version2['committed'] ? version2['message'] : '<Uncomitted>'}</pre>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h4 style={{color: 'green'}}>Added</h4>
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
                                <h4 style={{color: 'red'}}>Removed</h4>
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
                    </div>
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
