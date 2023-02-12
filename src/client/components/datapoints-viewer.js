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

import Async from 'components/async';
import Modal from 'components/modal';
import {RenderDatapoint} from 'components/preview-details';
import SignedImage from 'components/signed-image';
import Canvas from 'components/canvas';
import baseJSONClient from 'clients/base-json-client';
import {getHexColor} from 'helpers/color-helper';
import {mod} from 'helpers/math';

const DatapointCard = ({datapoint = {}, onClick, zoomable, showDetails, maxHeight}) => {
    const {predictions = [], groundtruths = [], type, metadata = {}} = datapoint;
    const [viewportHeight, setViewportHeight] = useState(0);
    const handleViewportLoad = (e) => {
        setViewportHeight(e.target.offsetHeight);
    };
    const [showHeatMap, setShowHeatMap] = useState(false);

    switch (type) {
    case 'IMAGE': {
        const imageH = metadata.height;
        const imageW = metadata.width;
        const imageObject = metadata.object;
        const someHeatMap = predictions.some((p) => p['feature_heatmap']);

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
                                                Display HeatMap
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
                                        predictions.filter(Boolean).map((p, i) => {
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
                                        groundtruths.filter(Boolean).map((g, i) => {
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

const DatapointsPage = ({datapoints, selectedDatapoints, onSelectedDatapointsChange}) => {
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
            <Modal isOpen={Boolean(datapointInModal)} onClose={() => setDatapointIndexInModal(-1)}
                title={selectedDatapoints ? (
                    <DatapointSelector datapoint={datapointInModal} selectedDatapoints={selectedDatapoints} onSelectedDatapointsChange={onSelectedDatapointsChange} />
                ) : null}
            >
                <div className='d-flex'>
                    <div className='fs-1 p-4 bg-white-blue cursor-pointer d-flex align-items-center mx-2' onClick={handleModalprevious}>
                        <GrPrevious />
                    </div>
                    <DatapointCard datapoint={datapointInModal} maxHeight={600} zoomable showDetails/>
                    <div className='fs-1 p-4 bg-white-blue cursor-pointer d-flex align-items-center mx-2' onClick={handleModalNext}>
                        <GrNext />
                    </div>
                </div>
            </Modal>
        </>
    );
};

DatapointsPage.propTypes = {
    datapoints: PropTypes.array.isRequired,
    selectedDatapoints: PropTypes.instanceOf(Set),
    onSelectedDatapointsChange: PropTypes.func
};

const DatapointsPageActions = ({filters, datapoints, selectedDatapoints, onSelectedDatapointsChange, renderActionButtons}) => {
    const selectAllRef = useRef();
    const handleSelectedDatapointsChange = (d) => {
        onSelectedDatapointsChange(new Set(d));
    };
    const handleSelectAllDataPoints = async () => {
        const allDatapoints = await baseJSONClient.post('/api/datapoints/select', {
            selectColumns: ['id'],
            filters
        });

        onSelectedDatapointsChange(new Set(allDatapoints.map((d) => d.id)));
    };

    // Reset selected datapoints when filters change.
    useEffect(() => {
        onSelectedDatapointsChange(new Set());
    }, [filters]);

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
                            <Async fetchData={() => baseJSONClient.post('/api/datapoints/count', {filters}, {memoized: 1000})}
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
                                refetchOnChanged={[JSON.stringify(filters)]}
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
    datapoints: PropTypes.array.isRequired,
    selectedDatapoints: PropTypes.instanceOf(Set).isRequired,
    onSelectedDatapointsChange: PropTypes.func,
    renderActionButtons: PropTypes.func
};

const PAGE_SIZE = 50;

const DatapointsViewer = ({filters, renderActionButtons}) => {
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
                    selectColumns: ['id', 'metadata', 'type', 'tags.name', 'tags.value', 'predictions.class_name'],
                    filters,
                    offset,
                    limit: PAGE_SIZE
                })}
                refetchOnChanged={[JSON.stringify(filters), offset]}
                renderData={(datapointsPage) => (
                    <Row className='g-2'>
                        {renderActionButtons ? (
                            <Col xs={12}>
                                <DatapointsPageActions
                                    filters={filters} datapoints={datapointsPage}
                                    onSelectedDatapointsChange={setSelectedDatapoints}
                                    selectedDatapoints={selectedDatapoints}
                                    renderActionButtons={renderActionButtons}
                                />
                            </Col>
                        ) : null}
                        <Col xs={12}>
                            <DatapointsPage datapoints={datapointsPage}
                                selectedDatapoints={selectedDatapoints}
                                onSelectedDatapointsChange={setSelectedDatapoints}
                            />
                        </Col>
                    </Row>
                )}
            />
            <Async
                spinner={false}
                fetchData={() => baseJSONClient.post('/api/datapoints/count', {filters}, {memoized: 1000})}
                refetchOnChanged={[JSON.stringify(filters)]}
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
    renderActionButtons: PropTypes.func
};

export default DatapointsViewer;
