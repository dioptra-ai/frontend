import PropTypes from 'prop-types';
import {TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import {VscDiscard, VscZoomIn, VscZoomOut} from 'react-icons/vsc';

import SignedImage from 'components/signed-image';
import SeekableVideo from 'components/seekable-video';

const FrameWithBoundingBox = ({videoUrl, imageUrl, frameH, boxW, boxH, boxT, boxL, videoSeekToSec, videoControls, height, onClick, zoomable}) => (
    <div onClick={onClick} className={onClick ? 'cursor-pointer' : zoomable ? 'cursor-grab' : ''} style={{position: 'relative'}}>
        <TransformWrapper>
            {({zoomIn, zoomOut, resetTransform}) => (
                <>
                    {zoomable ? (
                        <div className='position-absolute bg-white fs-2' style={{zIndex: 1}}>
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
                                height={height}
                                width='auto'
                                controls={videoControls}
                            />
                        ) : (
                            <SignedImage
                                rawUrl={imageUrl}
                                height={height}
                            />
                        )}
                        {
                            (boxH && boxW && boxT && boxL && !isNaN(height) && frameH) ? (
                                <div
                                    className='heat-map-box'
                                    style={{
                                        position: 'absolute',
                                        height: boxH * (height / frameH),
                                        width: boxW * (height / frameH),
                                        top: boxT * (height / frameH),
                                        left: boxL * (height / frameH)
                                    }}
                                />
                            ) : null
                        }
                    </TransformComponent>
                </>
            )}
        </TransformWrapper>
    </div>
);

FrameWithBoundingBox.propTypes = {
    videoUrl: PropTypes.string,
    videoSeekToSec: PropTypes.number,
    imageUrl: PropTypes.string,
    frameH: PropTypes.number,
    boxW: PropTypes.number,
    boxH: PropTypes.number,
    boxT: PropTypes.number,
    boxL: PropTypes.number,
    height: PropTypes.number.isRequired,
    videoControls: PropTypes.bool,
    onClick: PropTypes.func,
    zoomable: PropTypes.bool
};

export default FrameWithBoundingBox;
