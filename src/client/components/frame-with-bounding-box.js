import PropTypes from 'prop-types';
import {Tooltip as BootstrapTooltip, OverlayTrigger} from 'react-bootstrap';
import {TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import {VscDiscard, VscZoomIn, VscZoomOut} from 'react-icons/vsc';
import {IoPricetagSharp} from 'react-icons/io5';
import {MdOutlineOnlinePrediction} from 'react-icons/md';

import SignedImage from 'components/signed-image';
import SeekableVideo from 'components/seekable-video';
import {getHexColor} from 'helpers/color-helper';

const FrameWithBoundingBox = ({videoUrl, imageUrl, frameH, boxW, boxH, boxT, boxL, prediction, groundtruth, videoSeekToSec, videoControls, height, onClick, zoomable}) => (
    <div onClick={onClick} style={{position: 'relative'}}>
        <TransformWrapper disabled={!zoomable}>
            {({zoomIn, zoomOut, resetTransform}) => (
                <>
                    <div className={`${onClick ? 'cursor-pointer' : zoomable ? 'cursor-grab' : ''} d-flex flex-column align-items-center`} >
                        <div>
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
                                        >
                                        </div>
                                    ) : null
                                }
                            </TransformComponent>
                        </div>
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

FrameWithBoundingBox.propTypes = {
    videoUrl: PropTypes.string,
    videoSeekToSec: PropTypes.number,
    imageUrl: PropTypes.string,
    frameH: PropTypes.number,
    boxW: PropTypes.number,
    boxH: PropTypes.number,
    boxT: PropTypes.number,
    boxL: PropTypes.number,
    prediction: PropTypes.string,
    groundtruth: PropTypes.string,
    height: PropTypes.number.isRequired,
    videoControls: PropTypes.bool,
    onClick: PropTypes.func,
    zoomable: PropTypes.bool
};

export default FrameWithBoundingBox;

export const ImageClassificationFrameWithBoundingBox = ({sample, ...rest}) => {

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

ImageClassificationFrameWithBoundingBox.propTypes = {
    sample: PropTypes.object.isRequired
};
