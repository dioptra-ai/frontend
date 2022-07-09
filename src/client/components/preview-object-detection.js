import {useState} from 'react';
import PropTypes from 'prop-types';
import {Tooltip as BootstrapTooltip, OverlayTrigger} from 'react-bootstrap';
import {TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import {VscDiscard, VscZoomIn, VscZoomOut} from 'react-icons/vsc';
import {IoPricetagSharp} from 'react-icons/io5';
import {MdOutlineOnlinePrediction} from 'react-icons/md';

import SignedImage from 'components/signed-image';
import {getHexColor} from 'helpers/color-helper';

const FrameWithBoundingBox = ({
    imageUrl, frameH,
    predBoxW, predBoxH, predBoxT, predBoxL,
    gtBoxW, gtBoxH, gtBoxT, gtBoxL, prediction,
    groundtruth, onClick, zoomable, maxHeight}) => {
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
                                <SignedImage
                                    rawUrl={imageUrl}
                                    onLoad={handleLoad}
                                    style={{maxHeight: maxHeight || '100%', maxWidth: '100%'}}
                                />
                                {
                                    (predBoxH && predBoxW && predBoxT && predBoxL && !isNaN(height) && frameH) ? (
                                        <div
                                            className='heat-map-box'
                                            style={{
                                                position: 'absolute',
                                                height: predBoxH * (height / frameH),
                                                width: predBoxW * (height / frameH),
                                                top: predBoxT * (height / frameH),
                                                left: predBoxL * (height / frameH)
                                            }}
                                        >
                                        </div>
                                    ) : null
                                }
                                {
                                    (gtBoxH && gtBoxW && gtBoxT && gtBoxL && !isNaN(height) && frameH) ? (
                                        <div
                                            className='heat-map-box'
                                            style={{
                                                position: 'absolute',
                                                height: gtBoxH * (height / frameH),
                                                width: gtBoxW * (height / frameH),
                                                top: gtBoxT * (height / frameH),
                                                left: gtBoxL * (height / frameH)
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
    imageUrl: PropTypes.string,
    frameH: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    predBoxW: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    predBoxH: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    predBoxT: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    predBoxL: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    gtBoxW: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    gtBoxH: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    gtBoxT: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    gtBoxL: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    prediction: PropTypes.string,
    groundtruth: PropTypes.string,
    maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    onClick: PropTypes.func,
    zoomable: PropTypes.bool
};

export default FrameWithBoundingBox;

export const PreviewObjectDetection = ({sample, ...rest}) => {

    return (
        <FrameWithBoundingBox
            imageUrl={sample['image_metadata.uri'].replace(/"/g, '')}
            frameW={sample['image_metadata.width']}
            frameH={sample['image_metadata.height']}
            predBoxW={sample['prediction.width']}
            predBoxH={sample['prediction.height']}
            predBoxL={sample['prediction.left']}
            predBoxT={sample['prediction.top']}
            gtBoxW={sample['groundtruth.width']}
            gtBoxH={sample['groundtruth.height']}
            gtBoxL={sample['groundtruth.left']}
            gtBoxT={sample['groundtruth.top']}
            prediction={sample['prediction.class_name']}
            groundtruth={sample['groundtruth.class_name']}
            {...rest}
        />
    );
};

PreviewObjectDetection.propTypes = {
    sample: PropTypes.object.isRequired
};
