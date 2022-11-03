import {useState} from 'react';
import PropTypes from 'prop-types';
import {TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import {VscDiscard, VscZoomIn, VscZoomOut} from 'react-icons/vsc';
import {IoPricetagSharp} from 'react-icons/io5';
import Form from 'react-bootstrap/Form';

import SignedImage from 'components/signed-image';
import SeekableVideo from 'components/seekable-video';
import {getHexColor} from 'helpers/color-helper';
import useLabels from 'hooks/use-labels';

/* eslint-disable complexity */
const PreviewImage = ({datapoint, videoSeekToSec, videoControls, onClick, zoomable, maxHeight}) => {
    const [height, setHeight] = useState();
    const [showHeatMap, setShowHeatMap] = useState(false);
    const {ref, predictions, groundtruths} = useLabels(datapoint);
    const handleLoad = ({target}) => {
        setHeight(target.offsetHeight);
    };
    const videoUrl = datapoint.video_metatada?.uri;
    const imageUrl = datapoint.image_metadata?.uri;
    const frameH = datapoint.image_metadata?.height || datapoint.video_metadata?.height;
    const frameW = datapoint.image_metadata?.width || datapoint.video_metadata?.width;
    const imageObject = datapoint.image_metadata?.object;
    const someHeatMap = predictions?.some((p) => p['feature_heatmap']);

    return (
        <div ref={ref} onClick={onClick} style={{position: 'relative'}}>
            <TransformWrapper disabled={!zoomable}>
                {({zoomIn, zoomOut, resetTransform}) => (
                    <div className={`${onClick ? 'cursor-pointer' : zoomable ? 'cursor-grab' : ''} d-flex flex-column align-items-center`} >
                        {zoomable ? (
                            <div className='position-absolute bg-white px-2 d-flex align-items-center' style={{zIndex: 1, top: -1, left: -1}}>
                                <VscZoomOut className='cursor-pointer fs-2' onClick={() => zoomOut()}/>
                                <VscZoomIn className='cursor-pointer fs-2' onClick={() => zoomIn()}/>
                                <VscDiscard className='cursor-pointer fs-2' onClick={() => resetTransform()}/>
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
                        <TransformComponent>
                            {videoUrl ? (
                                <SeekableVideo
                                    url={videoUrl}
                                    seekToSecs={videoSeekToSec}
                                    onLoad={handleLoad}
                                    width='auto'
                                    controls={videoControls}
                                    style={{maxHeight: maxHeight || '100%', maxWidth: '100%'}}
                                />
                            ) : (
                                <SignedImage
                                    rawUrl={imageUrl}
                                    onLoad={handleLoad}
                                    style={{maxHeight: maxHeight || '100%', maxWidth: '100%'}}
                                />
                            )}
                            {/* eslint-disable-next-line react/no-unknown-property */}
                            <style jsx>{`
                                .hover-fade:hover {
                                    opacity: 0.4;
                                    transition: opacity 0.2s ease-in-out;
                                }
                            `}</style>
                            {
                                predictions?.filter(Boolean).map((p, i) => {
                                    const box = imageObject || p;
                                    const heatmap = p['feature_heatmap'];
                                    const heatMapMax = heatmap && Math.max(...heatmap.flat());

                                    return (
                                        <div key={i}
                                            className='position-absolute d-flex flex-column hover-fade'
                                            style={'top' in box ? {
                                                height: box['height'] * (height / frameH),
                                                width: box['width'] * (height / frameH),
                                                top: box['top'] * (height / frameH),
                                                left: box['left'] * (height / frameH),
                                                border: '1px solid',
                                                borderColor: getHexColor(p['class_name']),
                                                boxSizing: 'content-box'
                                            } : {
                                                bottom: 0,
                                                display: predictions.length > 1 && !('top' in box) ? 'none' : 'block'
                                            }}
                                        >
                                            <span className='position-absolute fs-7 px-1 text-nowrap' style={{
                                                backgroundColor: getHexColor(p['class_name']),
                                                bottom: box['top'] > frameH - box['top'] - box['height'] ? '100%' : 'unset',
                                                top: box['top'] > frameH - box['top'] - box['height'] ? 'unset' : '100%',
                                                left: box['left'] < frameW - box['left'] - box['width'] ? '100%' : 'unset',
                                                right: box['left'] < frameW - box['left'] - box['width'] ? 'unset' : '100%'
                                            }}
                                            >{p['class_name']}</span>
                                            {showHeatMap && heatmap?.map((row, i) => (
                                                <div key={i} className='d-flex flex-grow-1'>
                                                    {row.map((col, j) => (
                                                        <div key={j} className='flex-grow-1' style={{
                                                            backgroundColor: `hsla(${(1 - col / heatMapMax) * 240}, 100%, 50%, 0.3)`
                                                        }}/>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })
                            }
                            {
                                groundtruths?.filter(Boolean).map((g, i) => {
                                    const box = imageObject || g;

                                    return (
                                        <div key={i}
                                            className='position-absolute hover-fade'
                                            style={'top' in box ? {
                                                height: box['height'] * (height / frameH),
                                                width: box['width'] * (height / frameH),
                                                top: box['top'] * (height / frameH),
                                                left: box['left'] * (height / frameH),
                                                border: '1px solid',
                                                borderColor: getHexColor(g['class_name']),
                                                boxSizing: 'content-box'
                                            } : {
                                                top: 0,
                                                display: groundtruths.length > 1 && !('top' in box) ? 'none' : 'block'
                                            }}
                                        >
                                            <span className='position-absolute fs-7 px-1 text-nowrap' style={{
                                                backgroundColor: getHexColor(g['class_name']),
                                                bottom: box['top'] > frameH - box['top'] - box['height'] ? '100%' : 'unset',
                                                top: box['top'] > frameH - box['top'] - box['height'] ? 'unset' : '100%',
                                                left: box['left'] < frameW - box['left'] - box['width'] ? '100%' : 'unset',
                                                right: box['left'] < frameW - box['left'] - box['width'] ? 'unset' : '100%'
                                            }}
                                            >{g['class_name']} {g['class_name'] ? <IoPricetagSharp /> : ''}</span>
                                        </div>
                                    );
                                })
                            }
                        </TransformComponent>
                    </div>
                )}
            </TransformWrapper>
        </div>
    );
};

PreviewImage.propTypes = {
    videoSeekToSec: PropTypes.number,
    maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    videoControls: PropTypes.bool,
    onClick: PropTypes.func,
    zoomable: PropTypes.bool,
    datapoint: PropTypes.object.isRequired
};

export default PreviewImage;
