import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import {TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import {VscDiscard, VscZoomIn, VscZoomOut} from 'react-icons/vsc';
import {GrNext, GrPrevious} from 'react-icons/gr';
import {MdOutlineVerifiedUser} from 'react-icons/md';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';

import {PerformanceBox} from 'pages/common/performance-per-class';
import Async from 'components/async';
import Modal from 'components/modal';
import {RenderDatapoint} from 'components/preview-details';
import SignedImage from 'components/signed-image';
import Canvas from 'components/canvas';
import baseJSONClient from 'clients/base-json-client';
import {getHexColor} from 'helpers/color-helper';
import {mod} from 'helpers/math';

import SegmentationMask from './segmentation-mask';

const DatapointCard = ({datapoint = {}, onClick, zoomable, showDetails, maxHeight}) => {
    const {predictions = [], groundtruths = [], type, metadata = {}} = datapoint;
    const [viewportHeight, setViewportHeight] = useState(0);
    const handleViewportLoad = (e) => {
        setViewportHeight(e.target.offsetHeight);
    };
    const [showHeatMap, setShowHeatMap] = useState(false);
    const [showPredictionMask, setShowPredictionMask] = useState(false);
    const [showGroundtruthMask, setShowGroundtruthMask] = useState(false);
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
        const imageObject = metadata.object;
        const someHeatMap = predictions.some((p) => p['feature_heatmap']);
        const somePredictionMask = predictions.some((p) => p['encoded_resized_segmentation_class_mask']);
        const someGroundtruthMask = groundtruths.some((g) => g['encoded_resized_segmentation_class_mask']);

        return (
            <Row onClick={onClick} className='g-2'>
                <Col xs={12} style={{position: 'relative'}}>
                    <TransformWrapper disabled={!zoomable}>
                        {({zoomIn, zoomOut, resetTransform}) => (
                            <div className={`${onClick ? 'cursor-pointer' : zoomable ? 'cursor-grab' : ''} d-flex flex-column align-items-center overflow-hidden`} style={{backgroundColor: '#18191B'}}>
                                {zoomable ? (
                                    <div className='position-absolute bg-white px-2 d-flex align-items-center' style={{zIndex: 1, top: -1, left: -1}}>
                                        <VscZoomOut className='cursor-pointer fs-2' onClick={() => zoomOut()} />
                                        <VscZoomIn className='cursor-pointer fs-2' onClick={() => zoomIn()} />
                                        <VscDiscard className='cursor-pointer fs-2' onClick={() => resetTransform()} />
                                        {someHeatMap ? (
                                            <Form.Label className='mb-0 d-flex cursor-pointer'>
                                                <Form.Check type='checkbox'
                                                    onChange={(e) => setShowHeatMap(e.target.checked)}
                                                    checked={showHeatMap}
                                                />
                                                    HeatMap
                                            </Form.Label>
                                        ) : null}
                                        {somePredictionMask ? (
                                            <Form.Label className='mb-0 me-2 d-flex cursor-pointer'>
                                                <Form.Check type='checkbox'
                                                    onChange={(e) => {
                                                        setShowPredictionMask(e.target.checked);
                                                        setShowGroundtruthMask(false);
                                                    }}
                                                    checked={showPredictionMask}
                                                />
                                                    Prediction Mask
                                            </Form.Label>
                                        ) : null}
                                        {someGroundtruthMask ? (
                                            <Form.Label className='mb-0 d-flex cursor-pointer'>
                                                <Form.Check type='checkbox'
                                                    onChange={(e) => {
                                                        setShowGroundtruthMask(e.target.checked);
                                                        setShowPredictionMask(false);
                                                    }}
                                                    checked={showGroundtruthMask}
                                                />
                                                    Groundtruth Mask
                                            </Form.Label>
                                        ) : null}
                                    </div>
                                ) : null}
                                <TransformComponent wrapperStyle={{overflow: 'visible'}}>
                                    <SignedImage
                                        rawUrl={metadata['uri']}
                                        onLoad={handleViewportLoad}
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
                                        // Segmentation predictions segmentation_class_mask.
                                        // More than one of them would overlap and would not really make sense.
                                        showPredictionMask ? predictions.filter((p) => p['encoded_resized_segmentation_class_mask'])
                                            .filter((_, i) => i === 0)
                                            .map((p, i) => (
                                                <div key={i} className='position-absolute h-100 w-100'>
                                                    <SegmentationMask encodedMask={p['encoded_resized_segmentation_class_mask']} classNames={p['class_names']} />
                                                </div>
                                            )) : null
                                    }
                                    {
                                        // Segmentation groundtruths segmentation_class_mask.
                                        // More than one of them would overlap and would not really make sense.
                                        showGroundtruthMask ? groundtruths.filter((g) => g['encoded_resized_segmentation_class_mask'])
                                            .filter((_, i) => i === 0)
                                            .map((g, i) => (
                                                <div key={i} className='position-absolute h-100 w-100'>
                                                    <SegmentationMask encodedMask={g['encoded_resized_segmentation_class_mask']} classNames={g['class_names']} />
                                                </div>
                                            )) : null
                                    }
                                    {
                                        // Object detection predictions bounding boxes.
                                        predictions.filter((p) => !p['encoded_resized_segmentation_class_mask']).map((p, i) => {
                                            const box = imageObject || p;
                                            const scale = viewportHeight / imageH;
                                            const heatmap = p['feature_heatmap'];
                                            const heatMapMax = heatmap && Math.max(...heatmap.flat());
                                            const hasBoxTop = box['top'] !== null && !isNaN(box['top']);

                                            return (
                                                <div key={i}
                                                    className='position-absolute hover-fade'
                                                    style={hasBoxTop ? {
                                                        height: box['height'] * scale,
                                                        width: box['width'] * scale,
                                                        top: box['top'] * scale,
                                                        left: box['left'] * scale,
                                                        border: '1px dashed',
                                                        borderColor: getHexColor(p['class_name']),
                                                        boxSizing: 'content-box'
                                                    } : {
                                                        top: 0,
                                                        display: predictions.length > 1 && !hasBoxTop ? 'none' : 'block'
                                                    }}
                                                >
                                                    <span className='fs-7 position-absolute px-1 text-nowrap' style={{
                                                        backgroundColor: getHexColor(p['class_name']),
                                                        ...(hasBoxTop ? {
                                                            bottom: box['top'] > imageH - box['top'] - box['height'] ? '100%' : 'unset',
                                                            top: box['top'] > imageH - box['top'] - box['height'] ? 'unset' : '100%',
                                                            left: box['left'] < imageW - box['left'] - box['width'] ? '100%' : 'unset',
                                                            right: box['left'] < imageW - box['left'] - box['width'] ? 'unset' : '100%'
                                                        } : {})
                                                    }}
                                                    >{p['class_name']}</span>
                                                    {
                                                        heatmap && showHeatMap ? (

                                                            <Canvas draw={(ctx) => {
                                                                const numRows = heatmap.length;
                                                                const numCols = heatmap[0].length;

                                                                ctx.canvas.width = numCols;
                                                                ctx.canvas.height = numRows;

                                                                heatmap.forEach((row, i) => {
                                                                    row.forEach((col, j) => {
                                                                        ctx.fillStyle = `hsla(${(1 - col / heatMapMax) * 240}, 100%, 50%, 0.3)`;
                                                                        ctx.fillRect(j, i, 1, 1);
                                                                    });
                                                                });
                                                            }} />
                                                        ) : null
                                                    }
                                                </div>
                                            );
                                        })
                                    }
                                    {
                                        // Object detection groundtruths bounding boxes.
                                        groundtruths.filter((g) => !g['encoded_resized_segmentation_class_mask']).map((g, i) => {
                                            const box = imageObject || g;
                                            const scale = viewportHeight / imageH;
                                            const hasBoxTop = box['top'] !== null && !isNaN(box['top']);

                                            return (
                                                <div key={i}
                                                    className='position-absolute hover-fade'
                                                    style={hasBoxTop ? {
                                                        height: box['height'] * scale,
                                                        width: box['width'] * scale,
                                                        top: box['top'] * scale,
                                                        left: box['left'] * scale,
                                                        border: '1px solid',
                                                        borderColor: getHexColor(g['class_name']),
                                                        boxSizing: 'content-box'
                                                    } : {
                                                        bottom: 0,
                                                        display: groundtruths.length > 1 && !hasBoxTop ? 'none' : 'block'
                                                    }}
                                                >
                                                    <span className='fs-7 position-absolute px-1 text-nowrap' style={{
                                                        backgroundColor: getHexColor(g['class_name']),
                                                        ...(hasBoxTop ? {
                                                            bottom: box['top'] > imageH - box['top'] - box['height'] ? '100%' : 'unset',
                                                            top: box['top'] > imageH - box['top'] - box['height'] ? 'unset' : '100%',
                                                            left: box['left'] < imageW - box['left'] - box['width'] ? '100%' : 'unset',
                                                            right: box['left'] < imageW - box['left'] - box['width'] ? 'unset' : '100%'
                                                        } : {
                                                            bottom: 0
                                                        })
                                                    }}
                                                    >{g['class_name']} {g['class_name'] ? <MdOutlineVerifiedUser /> : ''}</span>
                                                </div>
                                            );
                                        })
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

const DatapointsPage = ({datapoints, showGroundtruthsInModal, selectedDatapoints, onSelectedDatapointsChange}) => {
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
                    title={selectedDatapoints ? (
                        <DatapointSelector datapoint={datapointInModal} selectedDatapoints={selectedDatapoints} onSelectedDatapointsChange={onSelectedDatapointsChange} />
                    ) : null}
                >
                    <div className='d-flex'>
                        <div className='fs-1 p-4 bg-white-blue cursor-pointer d-flex align-items-center mx-2' onClick={handleModalprevious}>
                            <GrPrevious />
                        </div>
                        <Async
                            fetchData={() => baseJSONClient.post('/api/datapoints/select', {
                                filters: [{
                                    'left': 'id',
                                    'op': '=',
                                    'right': datapointInModal.id
                                }],
                                selectColumns: [
                                    'id', 'metadata', 'type', 'text',
                                    'tags.name', 'tags.value',
                                    'predictions.encoded_resized_segmentation_class_mask',
                                    'predictions.class_name', 'predictions.class_names',
                                    'predictions.confidence', 'predictions.confidences',
                                    'predictions.model_name',
                                    'predictions.top', 'predictions.left', 'predictions.width', 'predictions.height',
                                    ...(showGroundtruthsInModal ? [
                                        'groundtruths.encoded_resized_segmentation_class_mask',
                                        'groundtruths.class_name', 'groundtruths.class_names',
                                        'groundtruths.top', 'groundtruths.left', 'groundtruths.width', 'groundtruths.height'
                                    ] : [])
                                ]
                            })}
                            refetchOnChanged={[datapointInModal.id]}
                            renderData={([datapoint]) => (<DatapointCard datapoint={datapoint} maxHeight={600} zoomable showDetails />)}
                        />
                        <div className='fs-1 p-4 bg-white-blue cursor-pointer d-flex align-items-center mx-2' onClick={handleModalNext}>
                            <GrNext />
                        </div>
                    </div>
                </Modal>
            ) : null}
        </>
    );
};

DatapointsPage.propTypes = {
    datapoints: PropTypes.array.isRequired,
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
                            <Async fetchData={() => baseJSONClient.post('/api/datapoints/count', {filters, datasetId}, {memoized: 1000})}
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
    datasetId: PropTypes.string.isRequired,
    datapoints: PropTypes.array.isRequired,
    selectedDatapoints: PropTypes.instanceOf(Set).isRequired,
    onSelectedDatapointsChange: PropTypes.func,
    renderActionButtons: PropTypes.func
};

const PAGE_SIZE = 50;

const DatapointsViewer = ({filters, datasetId, renderActionButtons}) => {
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
                                selectedDatapoints={selectedDatapoints}
                                onSelectedDatapointsChange={setSelectedDatapoints}
                            />
                        </Col>
                    </Row>
                )}
            />
            <Async
                spinner={false}
                fetchData={() => baseJSONClient.post('/api/datapoints/count', {filters, datasetId}, {memoized: 1000})}
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
    renderActionButtons: PropTypes.func
};

export default DatapointsViewer;
