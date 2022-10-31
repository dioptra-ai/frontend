import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import {VscDiscard, VscZoomIn, VscZoomOut} from 'react-icons/vsc';
import {IoPricetagSharp} from 'react-icons/io5';
import {useInView} from 'react-intersection-observer';

import SignedImage from 'components/signed-image';
import SeekableVideo from 'components/seekable-video';
import {getHexColor} from 'helpers/color-helper';
import metricsClient from 'clients/metrics';

/* eslint-disable complexity */
const PreviewImage = ({datapoint, videoSeekToSec, videoControls, onClick, zoomable, maxHeight}) => {
    const [height, setHeight] = useState();
    const {ref, inView} = useInView();
    const handleLoad = ({target}) => {
        setHeight(target.offsetHeight);
    };
    const videoUrl = datapoint.video_metatada?.uri;
    const imageUrl = datapoint.image_metadata?.uri;
    const frameH = datapoint.image_metadata?.height || datapoint.video_metadata?.height;
    const {prediction, groundtruth} = datapoint;
    const [requestPredictions, setRequestPredictions] = useState([]);
    const [requestGroundtruths, setRequestGroundtruths] = useState([]);
    const predictions = prediction ? [prediction] : requestPredictions;
    const groundtruths = groundtruth ? [groundtruth] : requestGroundtruths;

    useEffect(() => {
        if (inView && !prediction && !groundtruth) {
            setRequestPredictions([]);
            setRequestGroundtruths([]);
            metricsClient('select', {
                select: '"prediction", "groundtruth"',
                filters: [{
                    left: 'request_id',
                    op: '=',
                    right: datapoint.request_id
                }, {
                    left: {
                        left: 'prediction',
                        op: 'is not null'
                    },
                    op: 'or',
                    right: {
                        left: 'groundtruth',
                        op: 'is not null'
                    }
                }]
            }).then((datapoints) => {
                setRequestPredictions(datapoints.map((d) => d.prediction));
                setRequestGroundtruths(datapoints.map((d) => d.groundtruth));
            });
        }
    }, [inView, datapoint.request_id]);

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
                                    z-index: 100;
                                }
                            `}</style>
                            {
                                predictions?.filter(Boolean).map((p, i) => (
                                    <div key={i}
                                        className='position-absolute hover-z100'
                                        style={{
                                            height: p['height'] * (height / frameH),
                                            width: p['width'] * (height / frameH),
                                            top: p['top'] * (height / frameH),
                                            left: p['left'] * (height / frameH),
                                            border: '1px solid',
                                            borderColor: getHexColor(p['class_name'])
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
                                groundtruths?.filter(Boolean).map((g, i) => (
                                    <div key={i}
                                        className='position-absolute hover-z100'
                                        style={{
                                            height: g['height'] * (height / frameH),
                                            width: g['width'] * (height / frameH),
                                            top: g['top'] * (height / frameH),
                                            left: g['left'] * (height / frameH),
                                            border: '1px solid',
                                            borderColor: getHexColor(g['class_name'])
                                        }}
                                    >
                                        <span className='position-absolute fs-7 px-1 text-nowrap' style={{
                                            backgroundColor: getHexColor(g['class_name']),
                                            top: 0,
                                            left: 0
                                        }}
                                        >{g['class_name']} {g['class_name'] ? <IoPricetagSharp /> : ''}</span>
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
