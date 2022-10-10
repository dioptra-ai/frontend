import {useState} from 'react';
import PropTypes from 'prop-types';
import {TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import {VscDiscard, VscZoomIn, VscZoomOut} from 'react-icons/vsc';
import {IoPricetagSharp} from 'react-icons/io5';

import SignedImage from 'components/signed-image';
import SeekableVideo from 'components/seekable-video';
import {getHexColor} from 'helpers/color-helper';

/* eslint-disable complexity */
const PreviewImage = ({datapoint, videoSeekToSec, videoControls, onClick, zoomable, maxHeight}) => {
    const [height, setHeight] = useState();
    const handleLoad = ({target}) => {
        setHeight(target.offsetHeight);
    };
    const videoUrl = datapoint['video_metatada.uri'];
    const imageUrl = datapoint['image_metadata.uri'];
    const frameH = datapoint['image_metadata.height'] || datapoint['video_metadata.height'];
    const {prediction, groundtruth} = datapoint;

    return (
        <div onClick={onClick} style={{position: 'relative'}}>
            <TransformWrapper disabled={!zoomable}>
                {({zoomIn, zoomOut, resetTransform}) => (
                    <div className={`${onClick ? 'cursor-pointer' : zoomable ? 'cursor-grab' : ''} d-flex flex-column align-items-center`} >
                        {zoomable ? (
                            <div className='position-absolute bg-white fs-2' style={{zIndex: 1, top: -1, left: -1}}>
                                <VscZoomOut className='cursor-pointer' onClick={() => zoomOut()}/>
                                <VscZoomIn className='cursor-pointer' onClick={() => zoomIn()}/>
                                <VscDiscard className='cursor-pointer' onClick={() => resetTransform()}/>
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
                            {
                                prediction?.map?.((p, i) => (
                                    <div key={i}
                                        className='position-absolute'
                                        style={{
                                            height: p['height'] * (height / frameH),
                                            width: p['width'] * (height / frameH),
                                            top: p['top'] * (height / frameH),
                                            left: p['left'] * (height / frameH),
                                            border: `1px solid ${getHexColor(p['class_name'])}`
                                        }}
                                    >
                                        <span className='position-absolute fs-7 px-1 text-nowrap' style={{
                                            backgroundColor: getHexColor(p['class_name']),
                                            top: 0,
                                            left: 0
                                        }}
                                        >{p['class_name']}</span>
                                    </div>
                                ))

                            }
                            {
                                groundtruth?.map?.((g, i) => (
                                    <div key={i}
                                        className='position-absolute'
                                        style={{
                                            height: g['height'] * (height / frameH),
                                            width: g['width'] * (height / frameH),
                                            top: g['top'] * (height / frameH),
                                            left: g['left'] * (height / frameH),
                                            border: `1px solid ${getHexColor(g['class_name'])}`
                                        }}
                                    >
                                        <span className='position-absolute fs-7 px-1 text-nowrap' style={{
                                            backgroundColor: getHexColor(g['class_name']),
                                            top: 0,
                                            left: 0
                                        }}
                                        >{g['class_name']} <IoPricetagSharp /></span>
                                    </div>
                                ))
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
