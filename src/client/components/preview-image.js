import {useState} from 'react';
import PropTypes from 'prop-types';
import {TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import {VscDiscard, VscZoomIn, VscZoomOut} from 'react-icons/vsc';
import {IoPricetagSharp} from 'react-icons/io5';

import SignedImage from 'components/signed-image';
import SeekableVideo from 'components/seekable-video';
import {getHexColor} from 'helpers/color-helper';
import useLabels from 'hooks/use-labels';

/* eslint-disable complexity */
const PreviewImage = ({datapoint, videoSeekToSec, videoControls, onClick, zoomable, maxHeight}) => {
    const [height, setHeight] = useState();
    const {ref, predictions, groundtruths} = useLabels(datapoint);
    const handleLoad = ({target}) => {
        setHeight(target.offsetHeight);
    };
    const videoUrl = datapoint.video_metatada?.uri;
    const imageUrl = datapoint.image_metadata?.uri;
    const frameH = datapoint.image_metadata?.height || datapoint.video_metadata?.height;
    const imageObject = datapoint.image_metadata?.object;

    return (
        <div ref={ref} onClick={onClick} style={{position: 'relative'}}>
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
                            {/* eslint-disable-next-line react/no-unknown-property */}
                            <style jsx>{`
                                .hover-z100:hover {
                                    opacity: 0.2;
                                }
                            `}</style>
                            {
                                predictions?.filter(Boolean).map((p, i) => {
                                    const box = imageObject || p;
                                    const heatmap = p['feature_heatmap'];

                                    return (
                                        <div key={i}
                                            className='position-absolute d-flex flex-column hover-z100'
                                            style={'top' in box ? {
                                                height: box['height'] * (height / frameH),
                                                width: box['width'] * (height / frameH),
                                                top: box['top'] * (height / frameH),
                                                left: box['left'] * (height / frameH),
                                                border: '1px solid',
                                                borderColor: getHexColor(p['class_name'])
                                            } : {
                                                bottom: 0,
                                                display: predictions.length > 1 && !('top' in box) ? 'none' : 'block'
                                            }}
                                        >
                                            {/* <span className='position-absolute fs-7 px-1 text-nowrap' style={{
                                                backgroundColor: getHexColor(p['class_name'])
                                            }}
                                            >{p['class_name']}</span> */}
                                            {heatmap?.map((row, i) => (
                                                <div key={i} className='d-flex flex-grow-1'>
                                                    {row.map((col, j) => (
                                                        <div key={j} className='flex-grow-1' style={{
                                                            backgroundColor: 'red',
                                                            opacity: col * 0.8
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
                                            className='position-absolute hover-z100'
                                            style={'top' in box ? {
                                                height: box['height'] * (height / frameH),
                                                width: box['width'] * (height / frameH),
                                                top: box['top'] * (height / frameH),
                                                left: box['left'] * (height / frameH),
                                                border: '1px solid',
                                                borderColor: getHexColor(g['class_name'])
                                            } : {
                                                top: 0,
                                                display: groundtruths.length > 1 && !('top' in box) ? 'none' : 'block'
                                            }}
                                        >
                                            <span className='position-absolute fs-7 px-1 text-nowrap' style={{
                                                backgroundColor: getHexColor(g['class_name'])
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
