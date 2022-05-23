import {useState} from 'react';
import PropTypes from 'prop-types';
import {Tooltip as BootstrapTooltip, OverlayTrigger} from 'react-bootstrap';
import {TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import {VscDiscard, VscZoomIn, VscZoomOut} from 'react-icons/vsc';
import {IoPricetagSharp} from 'react-icons/io5';
import {MdOutlineOnlinePrediction} from 'react-icons/md';

import SignedImage from 'components/signed-image';
import SeekableVideo from 'components/seekable-video';
import {getHexColor} from 'helpers/color-helper';

const FrameWithBoundingBox = ({videoUrl, imageUrl, frameH, boxW, boxH, boxT, boxL, prediction, groundtruth, videoSeekToSec, videoControls, onClick, zoomable, maxHeight}) => {
    const [height, setHeight] = useState();
    const handleLoad = ({target}) => {
        setHeight(target.offsetHeight);
    };

    return (
        <div onClick={onClick} style={{position: 'relative'}}>
            <TransformWrapper disabled={!zoomable}>
                {({zoomIn, zoomOut, resetTransform}) => (
                    <>
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
                                        >
                                        </div>
                                    ) : null
                                }
                            </TransformComponent>
                        </div>
                        <div>
                            {prediction ? (
                                <div className='text-dark'>
                                    <OverlayTrigger overlay={<BootstrapTooltip>Predicted: {prediction}</BootstrapTooltip>}>
                                        <div className='text-truncate'><MdOutlineOnlinePrediction className='fs-3' style={{color: getHexColor(prediction)}}/> {prediction}</div>
                                    </OverlayTrigger>
                                </div>
                            ) : null}
                            {groundtruth ? (
                                <div className='text-dark'>
                                    <OverlayTrigger overlay={<BootstrapTooltip>Ground Truth: {groundtruth}</BootstrapTooltip>}>
                                        <div className='text-truncate'><IoPricetagSharp className='fs-3' style={{color: getHexColor(groundtruth)}}/> {groundtruth}</div>
                                    </OverlayTrigger>
                                </div>
                            ) : null}
                        </div>
                    </>
                )}
            </TransformWrapper>
        </div>
    );
};

FrameWithBoundingBox.propTypes = {
    videoUrl: PropTypes.string,
    videoSeekToSec: PropTypes.number,
    imageUrl: PropTypes.string,
    frameH: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    boxW: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    boxH: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    boxT: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    boxL: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    prediction: PropTypes.string,
    groundtruth: PropTypes.string,
    maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    videoControls: PropTypes.bool,
    onClick: PropTypes.func,
    zoomable: PropTypes.bool
};

export default FrameWithBoundingBox;

export const PreviewImageClassification = ({sample, ...rest}) => {

    return (
        <FrameWithBoundingBox
            imageUrl={sample['image_metadata.uri'].replace(/"/g, '')}
            frameW={sample['image_metadata.width']}
            frameH={sample['image_metadata.height']}
            boxW={sample['image_metadata.object.width']}
            boxH={sample['image_metadata.object.height']}
            boxL={sample['image_metadata.object.left']}
            boxT={sample['image_metadata.object.top']}
            prediction={sample['prediction']}
            groundtruth={sample['groundtruth']}
            {...rest}
        />
    );
};

PreviewImageClassification.propTypes = {
    sample: PropTypes.object.isRequired
};
