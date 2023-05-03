import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import {saveAs} from 'file-saver';
import {Link, useHistory, useParams} from 'react-router-dom';
import Form from 'react-bootstrap/Form';

import Select from 'components/select';
import Async from 'components/async';
import baseJSONClient from 'clients/base-json-client';
import Menu from 'components/menu';
import TopBar from 'pages/common/top-bar';
import DatapointsViewer from 'components/datapoints-viewer';

const DatasetVersionViewer = ({versionId, showDatapointActions}) => {

    return (
        <Async
            fetchData={() => baseJSONClient(`/api/dataset/version/${versionId}/datapoint-ids`)}
            refetchOnChanged={[versionId]}
            renderData={(datapointIds) => {

                return (
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
                                    }} className='link-danger'>Remove from dataset</a>
                                ) : null;
                            } : null}
                        />
                    </div>
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
                                            <Link to={`/dataset/${dataset['uuid']}`}>See Dataset</Link>
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
                                        <Form.Label column className='mb-0 text-nowrap'>Versions:</Form.Label>
                                        <Select name='versionId' className='ms-1 me-2' defaultValue={versionId}>
                                            {
                                                versions.map((version) => (
                                                    <option key={version['uuid']} value={version['uuid']}>
                                                        {version['committed'] ? `"${version['message']}"` : '<Uncommitted>'} ({new Date(version['created_at']).toLocaleString()})
                                                    </option>
                                                ))
                                            }
                                        </Select>
                                        <Button variant='secondary' size='s' className='text-nowrap me-2' onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            history.push(`/dataset/version/${e.target.parentElement.elements['versionId'].value}`);
                                        }}>View</Button>
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
