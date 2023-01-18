import PropTypes from 'prop-types';
import {Col, Row} from 'react-bootstrap';
import {Link, useParams} from 'react-router-dom';

import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';
import DataViewer from './data-viewer';
import Async from 'components/async';
import baseJSONClient from 'clients/base-json-client';
import Menu from 'components/menu';
import TopBar from 'pages/common/top-bar';

const DatasetVersionViewer = ({dataViewerProps, versionId}) => {

    return (
        <Async
            fetchData={() => baseJSONClient(`/api/dataset/version/${versionId}/datapoints`)}
            refetchOnChanged={[versionId]}
            renderData={(datapoints) => {
                const datapointIds = datapoints.map((datapoint) => datapoint['uuid']);

                return (
                    <>
                        <Async
                            fetchData={() => baseJSONClient('/api/datapoints/_legacy-get-groundtruth-prediction-events', {
                                method: 'post',
                                body: {datapointIds}
                            })}
                            refetchOnChanged={[datapointIds]}
                            renderData={(events) => {
                                const getHistogram = (events, getClassName) => events.reduce((acc, event) => {
                                    const name = getClassName(event);

                                    if (name) {
                                        if (!acc[name]) {
                                            acc[name] = 0;
                                        }
                                        acc[name] += 1;
                                    }

                                    return acc;
                                }, {});
                                const groundtruths = getHistogram(events, (event) => event['groundtruth']?.['class_name']);
                                const predictions = getHistogram(events, (event) => event['prediction']?.['class_name']);

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
                                                        yAxisTickFormatter={(v) => Number(v).toLocaleString()}
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
                                                        yAxisTickFormatter={(v) => Number(v).toLocaleString()}
                                                    />
                                                </Col>
                                            ) : null
                                        }
                                    </Row>
                                );
                            }}
                        />
                        <DataViewer datapointIds={datapointIds} {...dataViewerProps}/>
                    </>
                );
            }}
        />
    );
};

DatasetVersionViewer.propTypes = {
    versionId: PropTypes.string.isRequired,
    dataViewerProps: PropTypes.object
};

export {DatasetVersionViewer};

const DatasetVersion = () => {
    const {versionId} = useParams();

    return (
        <Menu>
            <TopBar hideTimePicker />
            <div className='bg-white-blue text-dark p-3'>
                <Async
                    fetchData={() => baseJSONClient(`/api/dataset/version/${versionId}`)}
                    refetchOnChanged={[versionId]}
                    renderData={(version) => (
                        <>
                            <div>Version: <span style={{fontFamily: 'monospace'}}>{version['uuid']}</span></div>
                            <div>Commit message: <span style={{fontFamily: 'monospace'}}>{
                                version['committed'] ? `"${version['message']}"` : '<Uncommitted>'
                            }</span></div>
                            <Async
                                fetchData={() => baseJSONClient(`/api/dataset/${version['dataset_uuid']}`)}
                                refetchOnChanged={[version['dataset_uuid']]}
                                renderData={(dataset) => (
                                    <div>
                                        Dataset: <Link to={`/dataset/${dataset['uuid']}`}>{dataset['display_name']}</Link>
                                    </div>
                                )}
                            />
                        </>
                    )}
                />
                <DatasetVersionViewer versionId={versionId}/>
            </div>
        </Menu>
    );
};

export default DatasetVersion;
