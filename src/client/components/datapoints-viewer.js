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
    datapoint: PropTypes.object.isRequired,
    maxHeight: PropTypes.number,
    onClick: PropTypes.func,
    showDetails: PropTypes.bool,
    zoomable: PropTypes.bool
};

const DatapointsPage = ({datapoints}) => {
    const [datapointIndexInModal, setDatapointIndexInModal] = useState(-1);
    const datapointInModal = datapoints[datapointIndexInModal];

    return (
        <>
            <Row className='g-2'>
                {datapoints.map((datapoint, i) => (
                    <Col key={datapoint.id} xs={4} md={3} lg={2}>
                        <div className='p-2 bg-white-blue border rounded' >
                            <DatapointCard datapoint={datapoint} maxHeight={200} onClick={() => setDatapointIndexInModal(i)} />
                        </div>
                    </Col>
                ))}
            </Row>
            <Modal isOpen={Boolean(datapointInModal)} onClose={() => setDatapointIndexInModal(-1)}>
                <div className='d-flex'>
                    <div className='fs-1 p-4 bg-white-blue cursor-pointer d-flex align-items-center mx-2'
                        onClick={() => setDatapointIndexInModal(mod(datapointIndexInModal - 1, datapoints.length))}
                    >
                        <GrPrevious />
                    </div>
                    <DatapointCard datapoint={datapointInModal} maxHeight={600} zoomable showDetails/>
                    <div className='fs-1 p-4 bg-white-blue cursor-pointer d-flex align-items-center mx-2'
                        onClick={() => setDatapointIndexInModal(mod(datapointIndexInModal + 1, datapoints.length))}
                    >
                        <GrNext />
                    </div>
                </div>
            </Modal>
        </>
    );
};

DatapointsPage.propTypes = {
    datapoints: PropTypes.array.isRequired
};

const DatapointsPageSelector = ({filters, datapoints, selectedDatapoints, onSelectedDatapointsChange}) => {
    const selectAllRef = useRef();
    const [allPagesSelected, setAllPagesSelected] = useState(false);
    const handleSelectedDatapointsChange = (d) => {
        setAllPagesSelected(false);
        onSelectedDatapointsChange(new Set(d));
    };
    const handleSelectAllDataPoints = async () => {
        setAllPagesSelected(true);

        const allDatapoints = await baseJSONClient.post('api/datapoints/select', {
            selectColumns: ['id'],
            filters
        });

        onSelectedDatapointsChange(new Set(allDatapoints.map((d) => d.id)));
    };

    useEffect(() => {
        onSelectedDatapointsChange(new Set());
        setAllPagesSelected(false);
    }, [filters]);

    useEffect(() => {
        if (selectAllRef.current) {
            const somePageSelected = selectedDatapoints.size && datapoints.map((d) => d.id).some((id) => selectedDatapoints.has(id));
            const allPageSelected = selectedDatapoints.size && datapoints.map((d) => d.id).every((id) => selectedDatapoints.has(id));

            selectAllRef.current.indeterminate = somePageSelected && !allPageSelected;
            selectAllRef.current.checked = allPageSelected;
        }
    }, [selectedDatapoints, datapoints]);

    return (
        <>
            {
                onSelectedDatapointsChange ? (
                    <Col xs = { 12} >
                        <div className='d-flex'>
                            <Form.Check id='select-all' ref={selectAllRef} className='me-2' type='checkbox' label='Select all' onChange={(e) => {
                                if (e.target.checked) {
                                    handleSelectedDatapointsChange(datapoints.map((d) => d.id));
                                } else {
                                    handleSelectedDatapointsChange([]);
                                }
                            }} />
                        </div>
                    </Col >
                ) : null}
            {
                selectedDatapoints.size ? (
                    <Col xs={12}>
                        <Async fetchData={() => baseJSONClient.post('api/datapoints/count', {filters}, {memoized: true})}
                            renderData={(itemsCount) => (
                                <div className='d-flex justify-content-center'>
                                    {
                                        allPagesSelected ? `All ${itemsCount.toLocaleString()} datapoints are selected.` :
                                            `${selectedDatapoints.size.toLocaleString()} datapoints are selected.`
                                    }
                                    &nbsp;
                                    {
                                        allPagesSelected ? (
                                            <a onClick={() => handleSelectedDatapointsChange([])}>Clear selection</a>
                                        ) : itemsCount > PAGE_SIZE ? (
                                            <a onClick={handleSelectAllDataPoints}>
                                                Select all {Number(itemsCount).toLocaleString()} datapoints
                                            </a>
                                        ) : null
                                    }
                                </div>
                            )}
                            refetchOnChanged={[JSON.stringify(filters)]}
                        />
                    </Col>
                ) : null
            }
        </>
    );
};

DatapointsPageSelector.propTypes = {
    filters: PropTypes.array.isRequired,
    datapoints: PropTypes.array.isRequired,
    selectedDatapoints: PropTypes.instanceOf(Set).isRequired,
    onSelectedDatapointsChange: PropTypes.func
};

const PAGE_SIZE = 50;

const DatapointsViewer = ({filters, onSelectedDatapointsChange}) => {
    const [offset, setOffset] = useState(0);
    const [selectedDatapoints, setSelectedDatapoints] = useState(new Set());
    const handleSelectedDatapointsChange = (datapoints) => {
        setSelectedDatapoints(datapoints);
        onSelectedDatapointsChange?.(datapoints);
    };

    useEffect(() => {
        setOffset(0);
    }, [filters]);

    return (
        <>
            <Async
                fetchData={() => baseJSONClient.post('api/datapoints/select', {
                    selectColumns: ['id', 'metadata', 'type', 'tags.name', 'tags.value', 'predictions.class_name'],
                    filters,
                    offset,
                    limit: PAGE_SIZE
                })}
                refetchOnChanged={[JSON.stringify(filters), offset]}
                renderData={(datapoints) => (
                    <Row className='g-2'>
                        {onSelectedDatapointsChange ? (
                            <DatapointsPageSelector
                                filters={filters} datapoints={datapoints}
                                onSelectedDatapointsChange={handleSelectedDatapointsChange}
                                selectedDatapoints={selectedDatapoints}
                            />
                        ) : null}
                        <Col xs={12}>
                            <DatapointsPage datapoints={datapoints} />
                        </Col>
                    </Row>
                )}
            />
            <Async
                spinner={false}
                fetchData={() => baseJSONClient.post('api/datapoints/count', {filters}, {memoized: true})}
                refetchOnChanged={[JSON.stringify(filters)]}
            >{
                    ({data: itemsCount, loading}) => (
                        <div className='d-flex justify-content-center my-5 align-items-center'>
                            <Button
                                variant='secondary'
                                disabled={offset === 0}
                                onClick={() => setOffset(offset - PAGE_SIZE)}
                            >
                        Previous
                            </Button>
                            <div className='mx-3'>
                                Showing {Number(offset + 1).toLocaleString()} - {loading ? '...' : `${Math.min(offset + PAGE_SIZE, itemsCount).toLocaleString()} of ${loading ? 'many' : Number(itemsCount).toLocaleString()}`}
                            </div>
                            <Button
                                variant='secondary'
                                disabled={!loading && offset + PAGE_SIZE >= itemsCount}
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
    onSelectedDatapointsChange: PropTypes.func
};

export default DatapointsViewer;
