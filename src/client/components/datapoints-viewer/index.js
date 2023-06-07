import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import {GrNext, GrPrevious} from 'react-icons/gr';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';

import Async from 'components/async';
import Modal from 'components/modal';
import baseJSONClient from 'clients/base-json-client';
import {mod} from 'helpers/math';
import ChatBot from 'components/chatbot';

import Datapoint from './datapoint';

const DatapointSelector = ({datapoint = {}, selectedDatapoints, onSelectedDatapointsChange}) => {

    return (
        <Form.Check type='checkbox'
            checked={selectedDatapoints.has(datapoint.id)}
            disabled={!onSelectedDatapointsChange}
            onChange={(e) => {
                const newSelectedDatapoints = new Set(selectedDatapoints);

                if (e.target.checked) {
                    newSelectedDatapoints.add(datapoint.id);
                } else {
                    newSelectedDatapoints.delete(datapoint.id);
                }
                onSelectedDatapointsChange(newSelectedDatapoints);
            }}
        />
    );
};

DatapointSelector.propTypes = {
    datapoint: PropTypes.object,
    selectedDatapoints: PropTypes.instanceOf(Set).isRequired,
    onSelectedDatapointsChange: PropTypes.func
};

const DatapointsPage = ({datapoints, showGroundtruthsInModal, modelNames, selectedDatapoints, onSelectedDatapointsChange}) => {
    const [datapointIndexInModal, setDatapointIndexInModal] = useState(-1);
    const datapointInModal = datapoints[datapointIndexInModal];
    const handleModalprevious = () => {
        setDatapointIndexInModal(mod(datapointIndexInModal - 1, datapoints.length));
    };
    const handleModalNext = () => {
        setDatapointIndexInModal(mod(datapointIndexInModal + 1, datapoints.length));
    };
    const handleKeyDownForModal = (e) => {
        if (datapointInModal) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handleModalprevious();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleModalNext();
            }
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDownForModal);

        return () => {
            window.removeEventListener('keydown', handleKeyDownForModal);
        };
    }, [datapointIndexInModal]);

    return (
        <>
            <Row className='g-2'>
                {datapoints.map((datapoint, i) => (
                    <Col key={datapoint.id} xs={4} md={3} lg={2}>
                        <div className='p-2 bg-white-blue border rounded' >
                            {
                                selectedDatapoints ? (
                                    <DatapointSelector datapoint={datapoint} selectedDatapoints={selectedDatapoints} onSelectedDatapointsChange={onSelectedDatapointsChange} />
                                ) : null
                            }
                            <Datapoint datapoint={datapoint} maxHeight={200} onClick={() => setDatapointIndexInModal(i)} />
                        </div>
                    </Col>
                ))}
            </Row>
            {datapointInModal ? (
                <Modal isOpen onClose={() => setDatapointIndexInModal(-1)}
                    title={(
                        <div className='d-flex justify-content-between align-items-center'>
                            <div className='d-flex align-items-center'>
                                {selectedDatapoints && (
                                    <DatapointSelector
                                        datapoint={datapointInModal} selectedDatapoints={selectedDatapoints} onSelectedDatapointsChange={onSelectedDatapointsChange}
                                    />
                                )}
                                <div className='fs-3 p-2 bg-white-blue cursor-pointer d-flex align-items-center mx-2' onClick={handleModalprevious}>
                                    <GrPrevious />
                                </div>
                            </div>
                            <div className='fs-3 p-2 bg-white-blue cursor-pointer d-flex align-items-center mx-2' onClick={handleModalNext}>
                                <GrNext />
                            </div>
                        </div>
                    )}
                >
                    <div className='pt-2'>
                        <Async
                            fetchData={() => Promise.all([
                                baseJSONClient.post('/api/datapoints/select', {
                                    filters: [{
                                        'left': 'id',
                                        'op': '=',
                                        'right': datapointInModal.id
                                    }],
                                    selectColumns: [
                                        'id', 'created_at', 'metadata', 'type', 'text',
                                        'tags.name', 'tags.value'
                                    ]
                                }),
                                modelNames?.length ? baseJSONClient.post('/api/predictions/select', {
                                    filters: [{
                                        'left': 'datapoint',
                                        'op': '=',
                                        'right': datapointInModal.id
                                    }, {
                                        'left': 'model_name',
                                        'op': 'in',
                                        'right': modelNames
                                    }],
                                    selectColumns: [
                                        'created_at', 'task_type', 'model_name',
                                        'encoded_resized_segmentation_class_mask',
                                        'class_name', 'class_names',
                                        'confidence', 'confidences',
                                        'bboxes.class_name', 'bboxes.confidence',
                                        'bboxes.encoded_resized_segmentation_mask', 'bboxes.coco_polygon',
                                        'bboxes.top', 'bboxes.left', 'bboxes.width', 'bboxes.height',
                                        'lanes.coco_polyline', 'lanes.confidence'
                                    ]
                                }) : Promise.resolve(null),
                                showGroundtruthsInModal ? baseJSONClient.post('/api/groundtruths/select', {
                                    filters: [{
                                        'left': 'datapoint',
                                        'op': '=',
                                        'right': datapointInModal.id
                                    }],
                                    selectColumns: [
                                        'created_at', 'task_type',
                                        'encoded_resized_segmentation_class_mask',
                                        'class_name', 'class_names',
                                        'bboxes.class_name',
                                        'bboxes.encoded_resized_segmentation_mask', 'bboxes.coco_polygon',
                                        'bboxes.top', 'bboxes.left', 'bboxes.width', 'bboxes.height',
                                        'lanes.coco_polyline'
                                    ]
                                }) : Promise.resolve(null)
                            ])}
                            refetchOnChanged={[datapointInModal.id]}
                            renderData={([[datapoint], predictions, groundtruths]) => (
                                <Datapoint maxHeight={600} zoomable showDetails datapoint={{
                                    ...datapoint,
                                    ...(predictions ? {predictions} : {}),
                                    ...(groundtruths ? {groundtruths} : {})
                                }}/>
                            )}
                        />
                    </div>
                </Modal>
            ) : null}
        </>
    );
};

DatapointsPage.propTypes = {
    datapoints: PropTypes.array.isRequired,
    modelNames: PropTypes.array,
    showGroundtruthsInModal: PropTypes.bool,
    selectedDatapoints: PropTypes.instanceOf(Set),
    onSelectedDatapointsChange: PropTypes.func
};

const DatapointsPageActions = ({filters, datasetId, datapoints, selectedDatapoints, onSelectedDatapointsChange, renderActionButtons}) => {
    const selectAllRef = useRef();
    const handleSelectedDatapointsChange = (d) => {
        onSelectedDatapointsChange(new Set(d));
    };
    const handleSelectAllDataPoints = async () => {
        const allDatapoints = await baseJSONClient.post('/api/datapoints/select', {
            selectColumns: ['id'],
            filters, datasetId
        });

        onSelectedDatapointsChange(new Set(allDatapoints.map((d) => d.id)));
    };

    const _TODO_REMOVE_HARD_CODED_FOR_DEMO_GET_SUMMARIES = (datapointIds) => {
        if (datapointIds.has('0017ee1e-e757-4e86-978c-d9cb527cbeda')) {
            // Cluster 1
            return 'Scenes of busy streets. Weather is cloudy / overcast. The road is in good condition. Trees and bridges casting shadows. Cars, trucks, pedestrians and bicycle are present. Some cars are parked on the side of the road. Say "received".';
        } else if (datapointIds.has('00107429-e1e8-4b6f-ae07-c1fdaedcaa79')) {
            // Cluster 2
            return 'Scene of busy urban highway. Mostly cars and buses on the scene. No pedestrians. Weather is clear and sunny. Buildings and tree lines are present in most images. Say "received".';
        } else if (datapointIds.has('001d0d3b-4ee8-49b0-8838-641bf58f372f')) {
            // Cluster 3
            return 'Scene of a highway. Low traffic. Road is in good condition. Weather is sunny and clear. Surroundings are mostly tree lines. Cars, buses and some pedestrians are present. Say "received".';
        } else {
            return 'Scene of a highway. Low traffic. Road is in good condition. Weather is sunny and clear. Surroundings are mostly tree lines. Cars, buses and some pedestrians are present. Say "received".';
        }
    };

    // Update select all checkbox when selected datapoints change.
    useEffect(() => {
        if (selectAllRef.current) {
            const somePageSelected = selectedDatapoints.size && datapoints.map((d) => d.id).some((id) => selectedDatapoints.has(id));
            const allPageSelected = selectedDatapoints.size && datapoints.map((d) => d.id).every((id) => selectedDatapoints.has(id));

            selectAllRef.current.indeterminate = somePageSelected && !allPageSelected;
            selectAllRef.current.checked = allPageSelected;
        }
    }, [selectedDatapoints, datapoints]);

    return (
        <Row className='g-2'>
            {
                onSelectedDatapointsChange ? (
                    <Col xs={12} className='d-flex'>
                        <Form.Check id='select-all' ref={selectAllRef} className='me-2' type='checkbox' label='Select all' onChange={(e) => {
                            if (e.target.checked) {
                                handleSelectedDatapointsChange(datapoints.map((d) => d.id));
                            } else {
                                handleSelectedDatapointsChange([]);
                            }
                        }} />
                    </Col>
                ) : null
            }
            {
                selectedDatapoints.size ? (
                    <Col xs={12} className='d-flex justify-content-between'>
                        <div>
                            <Async className='d-inline' fetchData={() => baseJSONClient.post('/api/datapoints/count', {filters, datasetId})}
                                refetchOnChanged={[JSON.stringify(filters), datasetId]}
                                renderData={(totalCount) => {
                                    const allDatapointsSelected = totalCount === selectedDatapoints.size;

                                    return (
                                        <div>
                                            {
                                                allDatapointsSelected ? `All ${totalCount.toLocaleString()} datapoints are selected.` :
                                                    `${selectedDatapoints.size.toLocaleString()} datapoint${selectedDatapoints.size > 1 ? 's are' : ' is'} selected.`
                                            }
                                            &nbsp;
                                            {
                                                !allDatapointsSelected && onSelectedDatapointsChange ? (
                                                    <a onClick={handleSelectAllDataPoints}>
                                                        Select all {Number(totalCount).toLocaleString()}
                                                    </a>
                                                ) : null
                                            }
                                        </div>
                                    );
                                }}
                            />
                        </div>
                        <div className='text-end'>
                            <ChatBot.SendButton
                                // message={`Here are the datapoints I selected: ${String(selectedDatapoints)}.`}
                                message={_TODO_REMOVE_HARD_CODED_FOR_DEMO_GET_SUMMARIES(selectedDatapoints)}
                            />
                            &nbsp;|&nbsp;
                            {renderActionButtons?.({selectedDatapoints})}
                        </div>
                    </Col>
                ) : null
            }
        </Row>
    );
};

DatapointsPageActions.propTypes = {
    filters: PropTypes.array.isRequired,
    datasetId: PropTypes.string,
    datapoints: PropTypes.array.isRequired,
    selectedDatapoints: PropTypes.instanceOf(Set).isRequired,
    onSelectedDatapointsChange: PropTypes.func,
    renderActionButtons: PropTypes.func
};

const PAGE_SIZE = 50;

const DatapointsViewer = ({filters, datasetId, modelNames, renderActionButtons, renderEmpty, defaultSelectedDatapoints, onSelectedDatapointsChange, selectedDatapoints}) => {
    const [offset, setOffset] = useState(0);
    const [lastReloadRequestedAt, setLastReloadRequestedAt] = useState(Date.now());
    const [uncontrolledSelectedDatapoints, setUncontrolledSelectedDatapoints] = useState(new Set(defaultSelectedDatapoints));
    const _selectedDatapoints = selectedDatapoints ?? uncontrolledSelectedDatapoints;
    const handleSelectedDatapointsChange = (datpointIds) => {
        if (onSelectedDatapointsChange) {
            onSelectedDatapointsChange(datpointIds);
        } else {
            setUncontrolledSelectedDatapoints(datpointIds);
        }
    };
    const handleReload = () => {
        setLastReloadRequestedAt(Date.now());
    };

    useEffect(() => {
        setOffset(0);

        if (!selectedDatapoints) {
            handleSelectedDatapointsChange(new Set());
        }
    }, [JSON.stringify(filters), datasetId]);

    return (
        <>
            <Async
                fetchData={() => baseJSONClient.post('/api/datapoints/select', {
                    selectColumns: ['id', 'metadata', 'type', 'text'],
                    filters,
                    offset,
                    limit: PAGE_SIZE,
                    datasetId
                })}
                refetchOnChanged={[JSON.stringify(filters), offset, datasetId, lastReloadRequestedAt]}
                renderData={(datapointsPage) => datapointsPage.length ? (
                    <Row className='g-2'>
                        {renderActionButtons ? (
                            <Col xs={12}>
                                <DatapointsPageActions
                                    filters={filters} datapoints={datapointsPage} datasetId={datasetId}
                                    onSelectedDatapointsChange={handleSelectedDatapointsChange}
                                    selectedDatapoints={_selectedDatapoints}
                                    renderActionButtons={renderActionButtons}
                                />
                            </Col>
                        ) : null}
                        <Col xs={12}>
                            <DatapointsPage datapoints={datapointsPage}
                                showGroundtruthsInModal={Boolean(datasetId)}
                                modelNames={modelNames}
                                selectedDatapoints={_selectedDatapoints}
                                onSelectedDatapointsChange={handleSelectedDatapointsChange}
                            />
                        </Col>
                    </Row>
                ) : renderEmpty?.({reload: handleReload}) ?? (
                    <div className='d-flex justify-content-center my-5 align-items-center text-secondary'>
                        No data
                    </div>
                )}
            />
            <Async
                spinner={false}
                fetchData={() => baseJSONClient.post('/api/datapoints/count', {filters, datasetId})}
                refetchOnChanged={[JSON.stringify(filters), datasetId, lastReloadRequestedAt]}
            >{
                    ({data: totalCount, loading}) => (
                        <div className='d-flex justify-content-center my-5 align-items-center'>
                            <Button
                                variant='secondary'
                                disabled={offset === 0}
                                onClick={() => setOffset(offset - PAGE_SIZE)}
                            >
                                &lt;
                            </Button>
                            <div className='mx-3'>
                                {
                                    loading ? `${Number(offset + 1).toLocaleString()} - ... of many` :
                                        totalCount === 0 ? '0 of 0' :
                                            `${Number(offset + 1).toLocaleString()} - ${Math.min(offset + PAGE_SIZE, totalCount).toLocaleString()} of ${Number(totalCount).toLocaleString()}`
                                }
                            </div>
                            <Button
                                variant='secondary'
                                disabled={!loading && offset + PAGE_SIZE >= totalCount}
                                onClick={() => setOffset(offset + PAGE_SIZE)}
                            >
                                &gt;
                            </Button>
                        </div>
                    )
                }
            </Async>
        </>
    );
};

DatapointsViewer.propTypes = {
    filters: PropTypes.arrayOf(PropTypes.object),
    datasetId: PropTypes.string,
    modelNames: PropTypes.arrayOf(PropTypes.string),
    renderActionButtons: PropTypes.func,
    defaultSelectedDatapoints: PropTypes.arrayOf(PropTypes.string),
    onSelectedDatapointsChange: PropTypes.func,
    selectedDatapoints: PropTypes.instanceOf(Set),
    renderEmpty: PropTypes.func
};

export default DatapointsViewer;
