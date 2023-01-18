import {useState} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {Button, Container, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {AiOutlineDelete} from 'react-icons/ai';
import {saveAs} from 'file-saver';
import Form from 'react-bootstrap/Form';

import Async from 'components/async';
import Menu from 'components/menu';
import TopBar from 'pages/common/top-bar';
import baseJSONClient from 'clients/base-json-client';
import metricsClient from 'clients/metrics';
import {DatasetCommitModal, DatasetEditModal} from 'components/dataset-modal';
import Select from 'components/select';
import {DatasetVersionViewer} from './dataset-version';

const Dataset = () => {
    const {datasetId} = useParams();
    const history = useHistory();
    const [isDatasetEditOpen, setIsDatasetEditOpen] = useState(false);
    const [isDatasetCommitOpen, setIsDatasetCommitVersionOpen] = useState(false);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [lastUpdatedOn, setLastUpdatedOn] = useState(new Date());

    return (
        <Menu>
            <TopBar hideTimePicker />
            <Async
                fetchData={() => baseJSONClient(`/api/dataset/${datasetId}`)}
                refetchOnChanged={[datasetId, lastUpdatedOn]}
                renderData={(dataset) => (
                    <>
                        <div className='bg-white-blue text-dark p-3'>
                            <h4>{dataset['display_name']}</h4>
                            <Async
                                fetchData={() => baseJSONClient(`/api/dataset/${datasetId}/versions`)}
                                renderData={(versions) => {
                                    const uncomittedVersion = versions.find((v) => v['committed'] === false);
                                    const dirty = uncomittedVersion['dirty'];

                                    return (
                                        <Form className='my-2 d-flex' style={{width: 'fit-content'}} onSubmit={async (e) => {
                                            const versionId = e.target.versionId.value;

                                            e.preventDefault();

                                            if (dirty && !confirm('You have uncommitted changes in your dataset. Checking out will discard these changes.\nAre you sure you want to continue?')) {
                                                return;
                                            }

                                            try {
                                                await baseJSONClient(`/api/dataset/${datasetId}/checkout/${versionId}`, {
                                                    method: 'POST'
                                                });
                                            } catch (error) {
                                                alert(error.message);
                                            }

                                            setLastUpdatedOn(new Date());
                                        }}>
                                            <Form.Label column className='mb-0 text-nowrap'>Versions:</Form.Label>
                                            <Select required key={versions[0]?.['uuid']} name='versionId' className='ms-1 me-2'>
                                                {versions.map((version) => version['committed'] ? (
                                                    <option key={version['uuid']} value={version['uuid']}>
                                                        {version['message']} ({new Date(version['created_at']).toLocaleString()})
                                                    </option>
                                                ) : (
                                                    <option key={version['uuid']} disabled selected value=''>
                                                        Uncomitted {dirty ? '(dirty)' : ''}
                                                    </option>
                                                ))}
                                            </Select>
                                            <Button variant='secondary' size='s' className='text-nowrap me-2' onClick={(e) => {
                                                const versionId = e.target.closest('form').versionId.value;

                                                if (!versionId) {
                                                    alert('Please select a version to diff with.');
                                                } else {
                                                    history.push(`/dataset/version/${versionId}`);
                                                }
                                            }}>
                                                View
                                            </Button>
                                            <Button variant='secondary' size='s' className='text-nowrap me-2' onClick={(e) => {
                                                const versionId = e.target.closest('form').versionId.value;

                                                if (!versionId) {
                                                    alert('Please select a version to diff with.');
                                                } else {
                                                    history.push(`/dataset/diff/${versionId}/${uncomittedVersion['uuid']}`);
                                                }
                                            }}>
                                                Diff with uncomitted
                                            </Button>
                                            <Button type='submit' variant='secondary' size='s' className='text-nowrap' name='action' value='checkout'>
                                                Checkout
                                            </Button>
                                        </Form>
                                    );
                                }}
                                refetchOnChanged={[datasetId, lastUpdatedOn]}
                            />
                            <a href='#' onClick={() => setIsDatasetEditOpen(true)}>Edit Name</a>
                                &nbsp;|&nbsp;
                            <a href='#' onClick={() => setIsDatasetCommitVersionOpen(true)}>Commit</a>
                                &nbsp;|&nbsp;
                            <a href='#' onClick={async () => {
                                const datapoints = await baseJSONClient(`/api/dataset/${datasetId}/datapoints`);
                                const data = await metricsClient('select', {
                                    select: '"uuid", "is_annotation", "timestamp", "request_id" as "datapoint_id", "model_id", "model_version", "image_metadata", "text_metadata", "video_metadata", "text", "tags", "features", "groundtruth", "prediction"',
                                    filters: [{
                                        left: 'request_id',
                                        op: 'in',
                                        right: datapoints.map((datapoint) => datapoint['request_id'])
                                    }],
                                    rm_fields: ['embeddings', 'logits', 'feature_heatmap'],
                                    as_csv: true
                                }, false);

                                saveAs(new Blob([data], {type: 'text/csv;charset=utf-8'}), `${dataset['display_name']}-${new Date().toISOString()}.csv`);

                            }}>Download as CSV</a>
                                &nbsp;|&nbsp;
                            <a href='#' style={{color: 'red'}} onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this dataset?\nThis action cannot be undone.')) {
                                    await baseJSONClient(`/api/dataset/${datasetId}`, {
                                        method: 'DELETE'
                                    });

                                    history.push('/dataset');
                                }
                            }}>Delete Dataset</a>
                            {(isDatasetEditOpen) ? (
                                <DatasetEditModal
                                    isOpen
                                    onClose={() => {
                                        setIsDatasetEditOpen(false);
                                    }}
                                    onDatasetSaved={({uuid}) => {
                                        setIsDatasetEditOpen(false);
                                        setLastUpdatedOn(new Date());
                                        history.push(`/dataset/${uuid}`);
                                    }}
                                    dataset={dataset}
                                />
                            ) : null}
                            {(isDatasetCommitOpen) ? (
                                <DatasetCommitModal
                                    isOpen
                                    onClose={() => {
                                        setIsDatasetCommitVersionOpen(false);
                                    }}
                                    onCommit={() => {
                                        setIsDatasetCommitVersionOpen(false);
                                        setLastUpdatedOn(new Date());
                                    }}
                                    datasetId={datasetId}
                                />
                            ) : null}
                        </div>
                    </>
                )}
            />
            <Container fluid>
                <Async
                    fetchData={() => baseJSONClient(`/api/dataset/${datasetId}/uncommitted-version`)}
                    refetchOnChanged={[datasetId, lastUpdatedOn]}
                    renderData={(uncommittedVersion) => {
                        const handleRemoveSelectedEvents = async (e) => {
                            e.preventDefault();
                            if (window.confirm('Are you sure you want to remove the selected datapoints?')) {
                                const datapoints = await baseJSONClient(`/api/dataset/${datasetId}/datapoints`);

                                await baseJSONClient(`/api/dataset/${datasetId}/remove`, {
                                    method: 'POST',
                                    body: {
                                        datapointIds: selectedEvents.map((e) => datapoints.find((d) => d['request_id'] === e['request_id'])['uuid'])
                                    }
                                });

                                setSelectedEvents([]);
                                setLastUpdatedOn(new Date());
                            }
                        };

                        return (
                            <DatasetVersionViewer
                                versionId={uncommittedVersion['uuid']}
                                dataViewerProps={{
                                    onSelectedChange: setSelectedEvents,
                                    renderButtons: () => (
                                        <OverlayTrigger overlay={<Tooltip>Remove {selectedEvents.length} from dataset</Tooltip>}>
                                            <button
                                                disabled={!selectedEvents.length}
                                                className='d-flex text-dark border-0 bg-transparent click-down' onClick={handleRemoveSelectedEvents}
                                            >
                                                <AiOutlineDelete className='fs-3 cursor-pointer' />
                                            </button>
                                        </OverlayTrigger>
                                    )
                                }}
                            />
                        );
                    }}
                />
            </Container>
        </Menu>
    );
};

export default Dataset;
