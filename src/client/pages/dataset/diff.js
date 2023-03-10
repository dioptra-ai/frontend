import {Link, useParams} from 'react-router-dom';
import {Col, Row} from 'react-bootstrap';

import baseJSONClient from 'clients/base-json-client';
import Async from 'components/async';
import Menu from 'components/menu';
import TopBar from 'pages/common/top-bar';
import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';
import DatapointsViewer from 'components/datapoints-viewer';

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
                                <div>Version1: <Link to={`/dataset/version/${version1['uuid']}`} style={{fontFamily: 'monospace'}}>{version1['uuid']}</Link></div>
                                <div>Commit message: <span style={{fontFamily: 'monospace'}}>{
                                    version1['committed'] ? `"${version1['message']}"` : '<Uncommitted>'
                                }</span></div>
                                <div>
                                    Dataset: <Link to={`/dataset/${dataset1['uuid']}`}>{dataset1['display_name']}</Link>
                                </div>
                            </Col>
                            <Col xs={1} className='d-flex align-items-center'>
                                <span className='fs-2'>{'->'}</span>
                            </Col>
                            <Col>
                                <div>Version2: <Link to={`/dataset/version/${version2['uuid']}`} style={{fontFamily: 'monospace'}}>{version2['uuid']}</Link></div>
                                <div>Commit message: <span style={{fontFamily: 'monospace'}}>{
                                    version2['committed'] ? `"${version2['message']}"` : '<Uncommitted>'
                                }</span></div>
                                <div>
                                    Dataset: <Link to={`/dataset/${dataset2['uuid']}`}>{dataset2['display_name']}</Link>
                                </div>
                            </Col>
                        </Row>
                        <Async
                            fetchData={() => Promise.all([
                                baseJSONClient('/api/groundtruths/get', {
                                    method: 'post',
                                    body: {datapointIds: removed}
                                }),
                                baseJSONClient('/api/groundtruths/get', {
                                    method: 'post',
                                    body: {datapointIds: added}
                                }),
                                baseJSONClient('/api/predictions/get', {
                                    method: 'post',
                                    body: {datapointIds: removed}
                                }),
                                baseJSONClient('/api/predictions/get', {
                                    method: 'post',
                                    body: {datapointIds: added}
                                })
                            ])}
                            refetchOnChanged={[removed, added]}
                            renderData={([removedGroundtruths, addedGroundtruths, removedPredictions, addedPredictions]) => {
                                const getNetHistogram = (added, removed) => {
                                    const histogram = {};

                                    for (const a of added) {
                                        if (a['class_name'] in histogram) {
                                            histogram[a['class_name']] += 1;
                                        } else {
                                            histogram[a['class_name']] = 1;
                                        }
                                    }
                                    for (const r of removed) {
                                        if (r['class_name'] in histogram) {
                                            histogram[r['class_name']] -= 1;
                                        } else {
                                            histogram[r['class_name']] = -1;
                                        }
                                    }

                                    return histogram;
                                };
                                const groundtruthNetHistogram = getNetHistogram(addedGroundtruths, removedGroundtruths);
                                const predictionNetHistogram = getNetHistogram(addedPredictions, removedPredictions);

                                return (
                                    <Row>
                                        {
                                            Object.entries(groundtruthNetHistogram).length ? (

                                                <Col>
                                                    <BarGraph
                                                        title='Net Groundtruth Changes'
                                                        bars={Object.entries(groundtruthNetHistogram).map(([className, count]) => ({
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
                                            Object.entries(predictionNetHistogram).length ? (
                                                <Col>
                                                    <BarGraph
                                                        title='Net Prediction Changes'
                                                        bars={Object.entries(predictionNetHistogram).map(([className, count]) => ({
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
                                <DatapointsViewer filters={[{left: 'datapoints.id', op: 'in', right: removed}]}/>
                            </Col>
                            <Col style={{borderLeft: '1px solid #ccc'}}>
                                <h4 style={{color: 'green'}}>Added: {Number(added.length).toLocaleString()}</h4>
                                <DatapointsViewer filters={[{left: 'datapoints.id', op: 'in', right: added}]} />
                            </Col>
                        </Row>
                    </div>
                )}
            />
        </Menu>
    );
};

export default DatasetDiff;
