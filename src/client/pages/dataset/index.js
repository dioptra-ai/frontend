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
import DatapointsViewer from 'components/datapoints-viewer';
import metricsClient from 'clients/metrics';
import DatasetModal from 'components/dataset-modal';
import Select from 'components/select';

const Dataset = () => {
    const {datasetVersionId} = useParams();
    const history = useHistory();
    const [isDatasetEditOpen, setIsDatasetEditOpen] = useState(false);
    const [isDatasetCloneOpen, setIsDatasetCloneOpen] = useState(false);
    const [isDatasetNewVersionOpen, setIsDatasetNewVersionOpen] = useState(false);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [lastUpdatedOn, setLastUpdatedOn] = useState(new Date());

    return (
        <Menu>
            <TopBar hideTimePicker />
            <Async
                fetchData={() => baseJSONClient(`/api/dataset/version/${datasetVersionId}`)}
                refetchOnChanged={[datasetVersionId, lastUpdatedOn]}
                renderData={(dataset) => (
                    <>
                        <div className='bg-white-blue text-dark p-3'>
                            <h4>{dataset['display_name']}</h4>
                            <Form className='my-2 d-flex' style={{width: 'fit-content'}}onSubmit={async (e) => {
                                const datasetVersionId = e.target.datasetVersionId.value;

                                e.preventDefault();

                                await baseJSONClient(`/api/dataset/version/${datasetVersionId}/same-parent-current`, {
                                    method: 'POST',
                                    body: {datasetVersionId}
                                });

                                history.push(`/datasets/${datasetVersionId}`);
                            }}>
                                <Form.Label column sm={2} className='mb-0'>Versions</Form.Label>
                                <Async
                                    className='mx-3 flex-grow-0'
                                    fetchData={() => baseJSONClient(`/api/dataset/version/${datasetVersionId}/same-parent`)}
                                    renderData={(versions) => (
                                        <Select name='datasetVersionId' defaultValue={datasetVersionId}>
                                            {versions.map((version) => (
                                                <option key={version['uuid']} value={version['uuid']}>
                                                    {`${version['display_name']} (${version['created_at']}) ${version['is_current'] ? '[Current]' : ''}`}
                                                </option>
                                            ))}
                                        </Select>
                                    )}
                                    refetchOnChanged={[datasetVersionId]}
                                />
                                <Button type='submit' variant='secondary' size='s' className='text-nowrap'>
                                    Set Current
                                </Button>
                            </Form>
                            <Async
                                fetchData={() => baseJSONClient(`/api/dataset/version/${datasetVersionId}/datapoints`)}
                                renderData={(datapoints) => (
                                    <>
                                        <a href='#' onClick={() => setIsDatasetEditOpen(true)}>Edit</a>
                                        &nbsp;|&nbsp;
                                        <a href='#' onClick={() => setIsDatasetCloneOpen(true)}>Clone</a>
                                        &nbsp;|&nbsp;
                                        <a href='#' onClick={() => setIsDatasetNewVersionOpen(true)}>New Version</a>
                                        &nbsp;|&nbsp;
                                        <a href='#' onClick={async () => {
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
                                            if (window.confirm('Are you sure you want to delete this dataset?')) {
                                                await baseJSONClient(`/api/dataset/version/${datasetVersionId}`, {
                                                    method: 'DELETE'
                                                });

                                                history.push('/datasets');
                                            }
                                        }}>Delete</a>
                                        {(isDatasetEditOpen || isDatasetCloneOpen || isDatasetNewVersionOpen) ? (
                                            <DatasetModal
                                                isOpen
                                                onClose={() => {
                                                    setIsDatasetEditOpen(false);
                                                    setIsDatasetCloneOpen(false);
                                                    setIsDatasetNewVersionOpen(false);
                                                }}
                                                onDatasetSaved={({uuid}) => {
                                                    setIsDatasetEditOpen(false);
                                                    setIsDatasetCloneOpen(false);
                                                    setIsDatasetNewVersionOpen(false);
                                                    setLastUpdatedOn(new Date());
                                                    history.push(`/datasets/${uuid}`);
                                                }}
                                                dataset={isDatasetEditOpen ? dataset : null}
                                                parentDataset={isDatasetNewVersionOpen ? dataset : null}
                                                defaultDisplayName={`Clone of ${dataset['display_name']}`}
                                                defaultFilters={datapoints.length ? [{
                                                    left: 'request_id',
                                                    op: 'in',
                                                    right: datapoints.map((datapoint) => datapoint['request_id'])
                                                }] : null}
                                            />
                                        ) : null}
                                    </>
                                )}
                            />
                        </div>
                    </>
                )}
            />
            <Container fluid>
                <Async
                    fetchData={() => baseJSONClient(`/api/dataset/version/${datasetVersionId}/datapoints`)}
                    refetchOnChanged={[datasetVersionId, lastUpdatedOn]}
                    renderData={(datapoints) => (
                        datapoints.length ? (
                            <Async
                                fetchData={() => metricsClient('select', {
                                    select: '"image_metadata", "video_metadata", "text_metadata", "request_id", "uuid", "tags"',
                                    filters: [{
                                        left: 'request_id',
                                        op: 'in',
                                        right: datapoints.map((datapoint) => datapoint['request_id'])
                                    }, {
                                        left: 'prediction',
                                        op: 'is null'
                                    }, {
                                        left: 'groundtruth',
                                        op: 'is null'
                                    }]
                                })}
                                renderData={(events) => {
                                    const eventsByRequestId = datapoints.reduce((acc, datapoint) => {
                                        const event = events.find((e) => e['request_id'] === datapoint['request_id']);

                                        acc[datapoint['request_id']] = event;

                                        return acc;
                                    }, {});
                                    const handleRemoveSelectedEvents = async (e) => {
                                        e.preventDefault();
                                        if (window.confirm('Are you sure you want to remove the selected datapoints?')) {
                                            await baseJSONClient(`/api/dataset/version/${datasetVersionId}/datapoints`, {
                                                method: 'DELETE',
                                                body: {
                                                    datapointIds: selectedEvents.map((e) => datapoints.find((d) => d['request_id'] === e['request_id'])['uuid'])
                                                }
                                            });

                                            setSelectedEvents([]);
                                            setLastUpdatedOn(new Date());
                                        }
                                    };

                                    return (
                                        <>
                                            <DatapointsViewer
                                                datapoints={datapoints.map((d) => eventsByRequestId[d['request_id']] || 'UNDEFINED')}
                                                onSelectedChange={setSelectedEvents}
                                                renderButtons={() => (
                                                    <OverlayTrigger overlay={<Tooltip>Remove {selectedEvents.length} from dataset</Tooltip>}>
                                                        <button
                                                            disabled={!selectedEvents.length}
                                                            className='d-flex text-dark border-0 bg-transparent click-down' onClick={handleRemoveSelectedEvents}
                                                        >
                                                            <AiOutlineDelete className='fs-3 cursor-pointer' />
                                                        </button>
                                                    </OverlayTrigger>
                                                )}
                                            />
                                        </>
                                    );
                                }}
                                refetchOnChanged={[datapoints]}
                            />
                        ) : (
                            <div className='text-center py-5 text-muted'>
                                <h3>No Datapoints</h3>
                                <p>Add some datapoints from the Data Cart to get started</p>
                            </div>
                        )
                    )}
                />
            </Container>
        </Menu>
    );
};

export default Dataset;
