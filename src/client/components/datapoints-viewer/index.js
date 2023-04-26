import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import {TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import {TbZoomCancel, TbZoomIn, TbZoomOut} from 'react-icons/tb';
import {GrNext, GrPrevious} from 'react-icons/gr';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';

import {PerformanceBox} from 'pages/common/performance-per-class';
import Async from 'components/async';
import Modal from 'components/modal';
import {RenderDatapoint} from 'components/preview-details';
import SignedImage from 'components/signed-image';
import baseJSONClient from 'clients/base-json-client';
import {mod} from 'helpers/math';

import BBox from './bbox';
import SegmentationMask from './segmentation-mask';
import Lane from './lane';
import {getHexColor} from 'helpers/color-helper';

const DatapointCard = ({datapoint = {}, onClick, zoomable, showDetails, maxHeight}) => {
    const {predictions = [], groundtruths = [], type, metadata = {}} = datapoint;
    const [viewportLoaded, setViewportLoaded] = useState(false);
    const [showHeatMap, setShowHeatMap] = useState(false);
    const [showPredictions, setShowPredictions] = useState(groundtruths.length === 0);
    const [showGroundtruths, setShowGroundtruths] = useState(groundtruths.length > 0);
    const confidencesPerClass = predictions.reduce((acc, p) => {
        const {class_names, confidences} = p;

        class_names?.forEach((c, i) => {
            acc[c] = acc[c] || [];
            acc[c].push(confidences[i]);
        });

        return acc;
    }, {});
    const averageConfidencePerClass = Object.keys(confidencesPerClass).reduce((acc, c) => {
        acc[c] = confidencesPerClass[c].reduce((a, b) => a + b, 0) / confidencesPerClass[c].length;

        return acc;
    }, {});

    switch (type) {
    case 'IMAGE': {
        const imageH = metadata.height;
        const imageW = metadata.width;
        const someHeatMap = predictions.some((p) => p.bboxes?.some((b) => b['feature_heatmap']));

        return (
            <Row onClick={onClick} className='g-2'>
                <Col xs={12} style={{position: 'relative'}}>
                    <TransformWrapper disabled={!zoomable}>
                        {({zoomIn, zoomOut, resetTransform}) => (
                            <div className={`${onClick ? 'cursor-pointer' : zoomable ? 'cursor-grab' : ''} d-flex flex-column align-items-center overflow-hidden`} style={{backgroundColor: '#18191B'}}>
                                {zoomable ? (
                                    <div className='position-absolute bg-white px-2 d-flex align-items-center' style={{zIndex: 1, top: -1, left: -1}}>
                                        <TbZoomOut className='cursor-pointer fs-2' onClick={() => zoomOut()} />
                                        <TbZoomIn className='cursor-pointer fs-2' onClick={() => zoomIn()} />
                                        <TbZoomCancel className='cursor-pointer fs-2' onClick={() => resetTransform()} />
                                        {someHeatMap ? (
                                            <Form.Label className='mb-0 d-flex cursor-pointer'>
                                                <Form.Check type='checkbox'
                                                    onChange={(e) => setShowHeatMap(e.target.checked)}
                                                    checked={showHeatMap}
                                                />
                                                    HeatMap
                                            </Form.Label>
                                        ) : null}
                                        {predictions.length ? (
                                            <Form.Label className='mb-0 me-2 d-flex cursor-pointer'>
                                                <Form.Check type='checkbox'
                                                    onChange={(e) => {
                                                        setShowPredictions(e.target.checked);
                                                    }}
                                                    checked={showPredictions}
                                                />
                                                    Show Predictions
                                            </Form.Label>
                                        ) : null}
                                        {groundtruths.length ? (
                                            <Form.Label className='mb-0 d-flex cursor-pointer'>
                                                <Form.Check type='checkbox'
                                                    onChange={(e) => {
                                                        setShowGroundtruths(e.target.checked);
                                                    }}
                                                    checked={showGroundtruths}
                                                />
                                                    Show Groundtruths
                                            </Form.Label>
                                        ) : null}
                                    </div>
                                ) : null}
                                <TransformComponent wrapperStyle={{overflow: 'visible'}}>
                                    <SignedImage
                                        rawUrl={metadata['uri']}
                                        onLoad={() => setViewportLoaded(true)}
                                        onUnload={() => setViewportLoaded(false)}
                                        style={{maxHeight: maxHeight || '100%', maxWidth: '100%'}}
                                    />
                                    {/* eslint-disable-next-line react/no-unknown-property */}
                                    <style>{`
                                        .hover-fade:hover {
                                            opacity: 0.4;
                                            transition: opacity 0.2s ease-in-out;
                                        }
                                    `}</style>
                                    {
                                        showPredictions && viewportLoaded ? predictions.map((p, i) => (
                                            <>
                                                {
                                                    p['encoded_resized_segmentation_class_mask'] ? (
                                                        <div key={`pred-${i}`} className='position-absolute h-100 w-100'>
                                                            <SegmentationMask encodedMask={p['encoded_resized_segmentation_class_mask']} classNames={p['class_names']} />
                                                        </div>
                                                    ) : null
                                                }
                                                {
                                                    p.bboxes?.map((bbox, j) => <BBox imageWidth={imageW} imageHeight={imageH} bbox={bbox} key={j} showHeatMap={showHeatMap} />)
                                                }
                                                {
                                                    p.lanes?.map((lane, j) => <Lane imageWidth={imageW} imageHeight={imageH} lane={lane} key={j} color={getHexColor('pred')} />)
                                                }
                                            </>
                                        )) : null
                                    }
                                    {
                                        showGroundtruths && viewportLoaded ? groundtruths.map((g, i) => (
                                            <>
                                                {
                                                    g['encoded_resized_segmentation_class_mask'] ? (
                                                        <div key={`gt-${i}`} className='position-absolute h-100 w-100'>
                                                            <SegmentationMask encodedMask={g['encoded_resized_segmentation_class_mask']} classNames={g['class_names']} />
                                                        </div>
                                                    ) : null
                                                }
                                                {
                                                    g.bboxes?.map((bbox, j) => <BBox imageWidth={imageW} imageHeight={imageH} bbox={bbox} key={j} showHeatMap={showHeatMap}/>)
                                                }
                                                {
                                                    g.lanes?.map((lane, j) => <Lane imageWidth={imageW} imageHeight={imageH} lane={lane} key={j} color={getHexColor('gt')} />)
                                                }
                                            </>
                                        )) : null
                                    }
                                </TransformComponent>
                            </div>
                        )}
                    </TransformWrapper>
                </Col>
                {showDetails && Object.keys(averageConfidencePerClass).length > 0 ? (
                    <Col xs={12}>
                        <PerformanceBox title='Confidence' minHeight={50} data={Object.entries(averageConfidencePerClass).map(([label, value]) => ({label, value}))} />
                    </Col>
                ) : null}
                {
                    showDetails ? (
                        <Col xs={12}>
                            <hr />
                            <RenderDatapoint datapoint={datapoint} />
                        </Col>
                    ) : null
                }
            </Row>
        );
    }
    default:
        return <RenderDatapoint datapoint={datapoint} />;
    }
};

DatapointCard.propTypes = {
    datapoint: PropTypes.object,
    maxHeight: PropTypes.number,
    onClick: PropTypes.func,
    showDetails: PropTypes.bool,
    zoomable: PropTypes.bool
};

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
                            <DatapointCard datapoint={datapoint} maxHeight={200} onClick={() => setDatapointIndexInModal(i)} />
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
                                <DatapointCard maxHeight={600} zoomable showDetails datapoint={{
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

    // Reset selected datapoints when filters change.
    useEffect(() => {
        onSelectedDatapointsChange(new Set());
    }, [filters, datasetId]);

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
                            <Async fetchData={() => baseJSONClient.post('/api/datapoints/count', {filters, datasetId})}
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
                                                allDatapointsSelected && onSelectedDatapointsChange ? (
                                                    <a onClick={() => handleSelectedDatapointsChange([])}>
                                                        Clear selection
                                                    </a>
                                                ) : onSelectedDatapointsChange ? (
                                                    <a onClick={handleSelectAllDataPoints}>
                                                        Select all {Number(totalCount).toLocaleString()} datapoints
                                                    </a>
                                                ) : null
                                            }
                                        </div>
                                    );
                                }}
                            />
                        </div>
                        <div>
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

const DatapointsViewer = ({filters, datasetId, modelNames, renderActionButtons}) => {
    const [offset, setOffset] = useState(0);
    const [selectedDatapoints, setSelectedDatapoints] = useState(renderActionButtons ? new Set() : null);

    useEffect(() => {
        setOffset(0);
        setSelectedDatapoints(renderActionButtons ? new Set() : null);
    }, [filters]);

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
                refetchOnChanged={[JSON.stringify(filters), offset, datasetId]}
                renderData={(datapointsPage) => (
                    <Row className='g-2'>
                        {renderActionButtons ? (
                            <Col xs={12}>
                                <DatapointsPageActions
                                    filters={filters} datapoints={datapointsPage} datasetId={datasetId}
                                    onSelectedDatapointsChange={setSelectedDatapoints}
                                    selectedDatapoints={selectedDatapoints}
                                    renderActionButtons={renderActionButtons}
                                />
                            </Col>
                        ) : null}
                        <Col xs={12}>
                            <DatapointsPage datapoints={datapointsPage}
                                showGroundtruthsInModal={Boolean(datasetId)}
                                modelNames={modelNames}
                                selectedDatapoints={selectedDatapoints}
                                onSelectedDatapointsChange={setSelectedDatapoints}
                            />
                        </Col>
                    </Row>
                )}
            />
            <Async
                spinner={false}
                fetchData={() => baseJSONClient.post('/api/datapoints/count', {filters, datasetId})}
                refetchOnChanged={[JSON.stringify(filters), datasetId]}
            >{
                    ({data: totalCount, loading}) => (
                        <div className='d-flex justify-content-center my-5 align-items-center'>
                            <Button
                                variant='secondary'
                                disabled={offset === 0}
                                onClick={() => setOffset(offset - PAGE_SIZE)}
                            >
                                Previous
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
                                Next
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
    renderActionButtons: PropTypes.func
};

export default DatapointsViewer;
