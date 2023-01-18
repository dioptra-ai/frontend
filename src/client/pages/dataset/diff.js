import {useParams} from 'react-router-dom';
import PropTypes from 'prop-types';
import {Col, Row} from 'react-bootstrap';

import baseJSONClient from 'clients/base-json-client';
import Async from 'components/async';
import Menu from 'components/menu';
import TopBar from 'pages/common/top-bar';
import DataViewer from './data-viewer';
import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';

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
                        <Row className='mb-3'>
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
                        <Async
                            fetchData={() => Promise.all([
                                baseJSONClient('/api/datapoints/_legacy-get-groundtruth-prediction-events', {
                                    method: 'post',
                                    body: {datapointIds: removed}
                                }),
                                baseJSONClient('/api/datapoints/_legacy-get-groundtruth-prediction-events', {
                                    method: 'post',
                                    body: {datapointIds: added}
                                })
                            ])}
                            refetchOnChanged={[removed, added]}
                            renderData={([removedEvents, addedEvents]) => {
                                const getHistogram = (initialAcc, events, getClassName, getNewValue) => {

                                    return events.reduce((acc, event) => {
                                        const className = getClassName(event);

                                        if (className) {
                                            acc[className] = getNewValue(acc[className]);
                                        }

                                        return acc;
                                    }, initialAcc);
                                };
                                const groundtruthAddedHistogram = getHistogram({}, addedEvents, (e) => e['groundtruth']?.['class_name'], (v) => v ? v + 1 : 1);
                                const groundtruthHistogram = getHistogram(groundtruthAddedHistogram, removedEvents, (e) => e['groundtruth']?.['class_name'], (v) => v ? v - 1 : -1);
                                const predictionAddedHistogram = getHistogram({}, addedEvents, (e) => e['prediction']?.['class_name'], (v) => v ? v + 1 : 1);
                                const predictionHistogram = getHistogram(predictionAddedHistogram, removedEvents, (e) => e['prediction']?.['class_name'], (v) => v ? v - 1 : -1);

                                return (
                                    <Row>
                                        {
                                            Object.entries(groundtruthHistogram).length ? (

                                                <Col>
                                                    <BarGraph
                                                        title='Net Groundtruth Changes'
                                                        bars={Object.entries(groundtruthHistogram).map(([className, count]) => ({
                                                            name: className,
                                                            value: count,
                                                            fill: getHexColor(className)
                                                        }))}
                                                        yAxisTickFormatter={(v) => Number(v).toLocaleString()}
                                                    />
                                                </Col>
                                            ) : null
                                        }
                                        {
                                            Object.entries(predictionHistogram).length ? (
                                                <Col>
                                                    <BarGraph
                                                        title='Net Prediction Changes'
                                                        bars={Object.entries(predictionHistogram).map(([className, count]) => ({
                                                            name: className,
                                                            value: count,
                                                            fill: getHexColor(className)
                                                        }))}
                                                        yAxisTickFormatter={(v) => Number(v).toLocaleString()}
                                                    />
                                                </Col>
                                            ) : null
                                        }
                                    </Row>
                                );
                            }}
                        />
                        <Row className='mt-3'>
                            <Col>
                                <h4 style={{color: 'red'}}>Removed: {Number(removed.length).toLocaleString()}</h4>
                                <DataViewer datapointIds={removed} />
                            </Col>
                            <Col style={{borderLeft: '1px solid #ccc'}}>
                                <h4 style={{color: 'green'}}>Added: {Number(added.length).toLocaleString()}</h4>
                                <DataViewer datapointIds={added} />
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
