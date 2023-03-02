import PropTypes from 'prop-types';
import {Button, Col, Row} from 'react-bootstrap';
import {saveAs} from 'file-saver';
import {Link, useHistory, useParams} from 'react-router-dom';
import Form from 'react-bootstrap/Form';

import Select from 'components/select';
import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';
import Async from 'components/async';
import baseJSONClient from 'clients/base-json-client';
import Menu from 'components/menu';
import TopBar from 'pages/common/top-bar';
import DatapointsViewer from 'components/datapoints-viewer';

const DatasetVersionViewer = ({versionId, showDatapointActions}) => {
    // Defining histogram function to be used in the renderData assignment
    const getHistogram = (values, getClassName) => values.reduce((acc, value) => {
        const name = getClassName(value);

        if (name) {
            if (!acc[name]) {
                acc[name] = 0;
            }
            acc[name] += 1;
        }

        return acc;
    }, {});

    return (
        <Async
            fetchData={() => baseJSONClient(`/api/dataset/version/${versionId}/datapoint-ids`)}
            refetchOnChanged={[versionId]}
            renderData={(datapointIds) => {

                return (
                    <>
                        <Async
                            fetchData={() => Promise.all([
                                baseJSONClient('/api/groundtruths', {
                                    method: 'post',
                                    body: {datapointIds}
                                }),
                                baseJSONClient('/api/predictions', {
                                    method: 'post',
                                    body: {datapointIds}
                                })
                            ])}
                            refetchOnChanged={[datapointIds]}
                            renderData={([groundtruths, predictions]) => {
                                const groundtruthsHist = getHistogram(groundtruths, (groundtruth) => groundtruth?.['class_name']);
                                const predictionsHist = getHistogram(predictions, (prediction) => prediction?.['class_name']);

                                return (
                                    <Row className='g-2 my-2'>
                                        {
                                            Object.keys(groundtruthsHist).length ? (
                                                <Col>
                                                    <BarGraph
                                                        title='Groundtruths'
                                                        bars={Object.entries(groundtruthsHist).map(([name, value]) => ({
                                                            name, value, fill: getHexColor(name)
                                                        }))}
                                                        yAxisTickFormatter={(v) => Number(v).toLocaleString()}
                                                    />
                                                </Col>
                                            ) : null
                                        }
                                        {
                                            Object.keys(predictionsHist).length ? (
                                                <Col>
                                                    <BarGraph
                                                        title='Predictions'
                                                        bars={Object.entries(predictionsHist).map(([name, value]) => ({
                                                            name, value, fill: getHexColor(name)
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
                        <div className='mt-3'>
                            <DatapointsViewer
                                filters={[{
                                    left: 'datapoints.id',
                                    op: 'in',
                                    right: datapointIds
                                }]}
                                renderActionButtons={showDatapointActions ? ({selectedDatapoints}) => {

                                    return selectedDatapoints.size ? (
                                        <a onClick={async () => {
                                            if (confirm('Are you sure you want to remove the selected datapoints from this dataset?')) {
                                                const datasetVersion = await baseJSONClient.get(`/api/dataset/version/${versionId}`);

                                                await baseJSONClient.post(`/api/dataset/${datasetVersion['dataset_uuid']}/remove`, {
                                                    datapointIds: Array.from(selectedDatapoints)
                                                });

                                                history.go(0);
                                            }
                                        }} style={{color: 'red'}}>Remove selected datapoints</a>
                                    ) : null;
                                } : null}
                            />
                        </div>
                    </>
                );
            }}
        />
    );
};

DatasetVersionViewer.propTypes = {
    versionId: PropTypes.string.isRequired,
    showDatapointActions: PropTypes.bool
};

export {DatasetVersionViewer};

const DatasetVersion = () => {
    const {versionId} = useParams();
    const history = useHistory();

    return (
        <Menu>
            <TopBar hideTimePicker />
            <div className='bg-white-blue text-dark p-3'>
                <Async
                    fetchData={() => baseJSONClient(`/api/dataset/version/${versionId}`)}
                    refetchOnChanged={[versionId]}
                    renderData={(version) => (
                        <>
                            <Async
                                fetchData={() => baseJSONClient.get(`/api/dataset/${version['dataset_uuid']}`)}
                                refetchOnChanged={[version['dataset_uuid']]}
                                renderData={(dataset) => (
                                    <>
                                        <h4 className='d-flex align-items-baseline'>
                                            Dataset Version:&nbsp;{dataset['display_name']}
                                        </h4>
                                        <div>Version id: <span style={{fontFamily: 'monospace'}}>{version['uuid']}</span></div>
                                        <div>Version commit message: <span style={{fontFamily: 'monospace'}}>{
                                            version['committed'] ? `"${version['message']}"` : '<Uncommitted>'
                                        }</span></div>
                                        <div>
                                            <Link to={`/dataset/${dataset['uuid']}`}>Go to dataset</Link>
                                            &nbsp;|&nbsp;
                                            <a href='#' onClick={async () => {
                                                const datapointIds = await baseJSONClient(`/api/dataset/version/${versionId}/datapoint-ids`);
                                                const data = await baseJSONClient.post('/api/datapoints/select', {
                                                    selectColumns: [
                                                        'id', 'metadata', 'type', 'text',
                                                        'tags.name', 'tags.value',
                                                        'groundtruths.task_type', 'groundtruths.class_name', 'groundtruths.top', 'groundtruths.left', 'groundtruths.width', 'groundtruths.height',
                                                        'predictions.task_type', 'predictions.class_name', 'predictions.top', 'predictions.left', 'predictions.width', 'predictions.height', 'predictions.confidence', 'predictions.model_name', 'predictions.metrics'
                                                    ],
                                                    filters: [{
                                                        left: 'datapoints.id',
                                                        op: 'in',
                                                        right: datapointIds
                                                    }]
                                                });

                                                saveAs(new Blob([JSON.stringify(data)], {type: 'application/json;charset=utf-8'}), `${dataset['display_name']}-${new Date().toISOString()}.json`);
                                            }}>Download version (JSON)</a>
                                        </div>
                                    </>
                                )}
                            />
                            <Async
                                fetchData={() => baseJSONClient(`/api/dataset/${version['dataset_uuid']}/versions`)}
                                refetchOnChanged={[version['dataset_uuid']]}
                                renderData={(versions) => (
                                    <Form className='my-2 d-flex' style={{width: 'fit-content'}} onSubmit={(e) => {
                                        e.preventDefault();
                                        const otherVersionId = e.target.versionId.value;

                                        history.push(`/dataset/diff/${otherVersionId}/${versionId}`);
                                    }}>
                                        <Form.Label column className='mb-0 text-nowrap'>Other Versions:</Form.Label>
                                        <Select name='versionId' className='ms-1 me-2' defaultValue={versionId}>
                                            {
                                                versions.map((version) => (
                                                    <option key={version['uuid']} value={version['uuid']}>
                                                        {version['committed'] ? `"${version['message']}"` : '<Uncommitted>'} ({new Date(version['created_at']).toLocaleString()})
                                                    </option>
                                                ))
                                            }
                                        </Select>
                                        <Button type='submit' variant='secondary' size='s' className='text-nowrap me-2'>{'->'} Diff</Button>
                                    </Form>
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
