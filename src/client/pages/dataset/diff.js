import {useParams} from 'react-router-dom';
import PropTypes from 'prop-types';
import {Col, Row} from 'react-bootstrap';

import baseJSONClient from 'clients/base-json-client';
import Async from 'components/async';
import Menu from 'components/menu';
import TopBar from 'pages/common/top-bar';
import DataViewer from './data-viewer';

const DatasetDiff = () => {
    const {versionId1, versionId2} = useParams();

    return (
        <Menu>
            <TopBar hideTimePicker />
            <Async
                fetchData={() => baseJSONClient(`/api/dataset/diff/${versionId1}/${versionId2}`)}
                refetchOnChanged={[versionId1, versionId2]}
                renderData={({added, removed, version1, version2, dataset1, dataset2}) => (
                    <div className='bg-white-blue text-dark p-3'>
                        <Row>
                            <Col>
                                <div>Version1: <span style={{fontFamily: 'monospace'}}>{version1['uuid']}</span></div>
                                <div>Commit message: <span style={{fontFamily: 'monospace'}}>{
                                    version1['committed'] ? `"${version1['message']}"` : '<Uncommitted>'
                                }</span></div>
                                <div>
                                    Dataset: {dataset1['display_name']} (<span style={{fontFamily: 'monospace'}}>{dataset1['uuid']}</span>)
                                </div>
                            </Col>
                            <Col xs={1} className='d-flex align-items-center'>
                                <span className='fs-2'>{'->'}</span>
                            </Col>
                            <Col>
                                <div>Version2: <span style={{fontFamily: 'monospace'}}>{version2['uuid']}</span></div>
                                <div>Commit message: <span style={{fontFamily: 'monospace'}}>{
                                    version2['committed'] ? `"${version2['message']}"` : '<Uncommitted>'
                                }</span></div>
                                <div>
                                    Dataset: {dataset1['display_name']} (<span style={{fontFamily: 'monospace'}}>{dataset2['uuid']}</span>)
                                </div>
                            </Col>
                        </Row>
                        <hr/>
                        <Row>
                            <Col>
                                <h4 style={{color: 'green'}}>Added: {Number(added.length).toLocaleString()}</h4>
                                <DataViewer datapointIds={added} />
                            </Col>
                            <Col>
                                <h4 style={{color: 'red'}}>Removed: {Number(removed.length).toLocaleString()}</h4>
                                <DataViewer datapointIds={removed} />
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
