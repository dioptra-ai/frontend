import {useState} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {Container, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {AiOutlineDelete} from 'react-icons/ai';
import {saveAs} from 'file-saver';

import Async from 'components/async';
import Menu from 'components/menu';
import TopBar from 'pages/common/top-bar';
import baseJSONClient from 'clients/base-json-client';
import DatapointsViewer from 'components/datapoints-viewer';
import metricsClient from 'clients/metrics';
import DatasetModal from 'components/dataset-modal';

const Dataset = () => {
    const {datasetId} = useParams();
    const history = useHistory();
    const [isDatasetEditOpen, setIsDatasetEditOpen] = useState(false);
    const [isDatasetCloneOpen, setIsDatasetCloneOpen] = useState(false);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [lastUpdatedOn, setLastUpdatedOn] = useState(new Date());

    return (
        <Menu>
            <TopBar hideTimePicker />
            <Async
                fetchData={() => baseJSONClient(`/api/datasets/${datasetId}`)}
                refetchOnChanged={[datasetId, lastUpdatedOn]}
                renderData={(dataset) => (
                    <>
                        <div className='bg-white-blue text-dark p-3'>
                            <h4>{dataset['display_name']}</h4>
                            <h6 className='text-muted'>Created {new Date(dataset['created_at']).toLocaleString()}</h6>
                            <Async
                                fetchData={() => baseJSONClient(`/api/datasets/${datasetId}/datapoints`)}
                                // refetchOnChanged={[datasetId, lastUpdatedOn]}
                                renderData={(datapoints) => (
                                    <>
                                        <a href='#' onClick={() => setIsDatasetEditOpen(true)}>Edit</a>
                                        &nbsp;|&nbsp;
                                        <a href='#' onClick={() => setIsDatasetCloneOpen(true)}>Clone</a>
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
                                                await baseJSONClient(`/api/datasets/${datasetId}`, {
                                                    method: 'DELETE'
                                                });

                                                history.push('/datasets');
                                            }
                                        }}>Delete</a>
                                        {(isDatasetEditOpen || isDatasetCloneOpen) ? (
                                            <DatasetModal
                                                isOpen
                                                onClose={() => {
                                                    setIsDatasetEditOpen(false);
                                                    setIsDatasetCloneOpen(false);
                                                }}
                                                onDatasetSaved={({uuid}) => {
                                                    setIsDatasetEditOpen(false);
                                                    setIsDatasetCloneOpen(false);
                                                    setLastUpdatedOn(new Date());
                                                    history.push(`/datasets/${uuid}`);
                                                }}
                                                dataset={isDatasetEditOpen ? dataset : null}
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
                    fetchData={() => baseJSONClient(`/api/datasets/${datasetId}/datapoints`)}
                    refetchOnChanged={[datasetId, lastUpdatedOn]}
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
                                    const handleRemoveSelectedEvents = async () => {
                                        if (window.confirm('Are you sure you want to remove the selected datapoints?')) {
                                            await baseJSONClient(`/api/datasets/${datasetId}/datapoints`, {
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
