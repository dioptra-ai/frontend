import PropTypes from 'prop-types';
import {useState} from 'react';
import {TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import {TbZoomCancel, TbZoomIn, TbZoomOut} from 'react-icons/tb';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';

import theme from 'styles/theme.module.scss';
import {PerformanceBox} from 'pages/common/performance-per-class';
import {RenderDatapoint} from 'components/preview-details';
import SignedImage from 'components/signed-image';
import BBox from './bbox';
import SegmentationMask from './segmentation-mask';
import Lane from './lane';
import {getHexColor} from 'helpers/color-helper';

const Datapoint = ({datapoint = {}, onClick, zoomable, showDetails, maxHeight}) => {
    const {predictions = [], groundtruths = [], type, metadata = {}} = datapoint;
    const [viewportLoaded, setViewportLoaded] = useState(false);
    const [showHeatMap, setShowHeatMap] = useState(false);
    const [showPredictions, setShowPredictions] = useState(groundtruths.length === 0);
    const [showGroundtruths, setShowGroundtruths] = useState(groundtruths.length > 0);
    const confidencesPerClass = predictions.reduce((acc, p) => {
        const {class_names, confidences} = p;

        class_names?.forEach((c, i) => {
            acc[c] = acc[c] || [];
            acc[c].push(confidences[i]);
        });

        return acc;
    }, {});
    const averageConfidencePerClass = Object.keys(confidencesPerClass).reduce((acc, c) => {
        acc[c] = confidencesPerClass[c].reduce((a, b) => a + b, 0) / confidencesPerClass[c].length;

        return acc;
    }, {});

    switch (type) {
    case 'IMAGE': {
        const imageH = metadata.height;
        const imageW = metadata.width;
        const someHeatMap = predictions.some((p) => p.bboxes?.some((b) => b['feature_heatmap']));

        return (
            <>
                <Row onClick={onClick} className='g-2'>
                    <Col className='d-flex align-items-center justify-content-center' style={{position: 'relative'}}>
                        <TransformWrapper disabled={!zoomable}>
                            {({zoomIn, zoomOut, resetTransform}) => (
                                <div className={`${onClick ? 'cursor-pointer' : zoomable ? 'cursor-grab' : ''} d-flex flex-column align-items-center overflow-hidden`} style={{backgroundColor: '#18191B'}}>
                                    {zoomable ? (
                                        <div className='position-absolute bg-white px-2 d-flex align-items-center' style={{zIndex: 1, top: -1, left: -1}}>
                                            <TbZoomOut className='cursor-pointer fs-2' onClick={() => zoomOut()} />
                                            <TbZoomIn className='cursor-pointer fs-2' onClick={() => zoomIn()} />
                                            <TbZoomCancel className='cursor-pointer fs-2' onClick={() => resetTransform()} />
                                            {someHeatMap ? (
                                                <Form.Label className='mb-0 d-flex cursor-pointer'>
                                                    <Form.Check type='checkbox'
                                                        onChange={(e) => setShowHeatMap(e.target.checked)}
                                                        checked={showHeatMap}
                                                    />
                                                        HeatMap
                                                </Form.Label>
                                            ) : null}
                                            {predictions.length ? (
                                                <Form.Label className='mb-0 me-2 d-flex cursor-pointer'>
                                                    <Form.Check type='checkbox'
                                                        onChange={(e) => {
                                                            setShowPredictions(e.target.checked);
                                                        }}
                                                        checked={showPredictions}
                                                    />
                                                        Show Predictions
                                                </Form.Label>
                                            ) : null}
                                            {groundtruths.length ? (
                                                <Form.Label className='mb-0 d-flex cursor-pointer'>
                                                    <Form.Check type='checkbox'
                                                        onChange={(e) => {
                                                            setShowGroundtruths(e.target.checked);
                                                        }}
                                                        checked={showGroundtruths}
                                                    />
                                                        Show Groundtruths
                                                </Form.Label>
                                            ) : null}
                                        </div>
                                    ) : null}
                                    <TransformComponent wrapperStyle={{overflow: 'visible'}}>
                                        <SignedImage
                                            rawUrl={metadata['uri']}
                                            onLoad={() => setViewportLoaded(true)}
                                            onUnload={() => setViewportLoaded(false)}
                                            style={{
                                                height: '100%',
                                                maxHeight: maxHeight || '100%',
                                                maxWidth: '100%'
                                            }}
                                        />
                                        {/* eslint-disable-next-line react/no-unknown-property */}
                                        <style>{`
                                            .hover-fade:hover {
                                                opacity: 0.4;
                                                transition: opacity 0.2s ease-in-out;
                                            }
                                        `}</style>
                                        {
                                            showPredictions && viewportLoaded ? predictions.map((p, i) => (
                                                <>
                                                    {
                                                        p['encoded_resized_segmentation_class_mask'] ? (
                                                            <div key={`pred-${i}`} className='position-absolute h-100 w-100'>
                                                                <SegmentationMask encodedMask={p['encoded_resized_segmentation_class_mask']} classNames={p['class_names']} />
                                                            </div>
                                                        ) : null
                                                    }
                                                    {
                                                        p.bboxes?.map((bbox, j) => <BBox imageWidth={imageW} imageHeight={imageH} bbox={bbox} key={j} showHeatMap={showHeatMap} />)
                                                    }
                                                    {
                                                        p.lanes?.map((lane, j) => <Lane imageWidth={imageW} imageHeight={imageH} lane={lane} key={j} color={getHexColor(p['model_name'])} />)
                                                    }
                                                </>
                                            )) : null
                                        }
                                        {
                                            showGroundtruths && viewportLoaded ? groundtruths.map((g, i) => (
                                                <>
                                                    {
                                                        g['encoded_resized_segmentation_class_mask'] ? (
                                                            <div key={`gt-${i}`} className='position-absolute h-100 w-100'>
                                                                <SegmentationMask encodedMask={g['encoded_resized_segmentation_class_mask']} classNames={g['class_names']} />
                                                            </div>
                                                        ) : null
                                                    }
                                                    {
                                                        g.bboxes?.map((bbox, j) => <BBox imageWidth={imageW} imageHeight={imageH} bbox={bbox} key={j} showHeatMap={showHeatMap} />)
                                                    }
                                                    {
                                                        g.lanes?.map((lane, j) => <Lane imageWidth={imageW} imageHeight={imageH} lane={lane} key={j} color={theme.primary} />)
                                                    }
                                                </>
                                            )) : null
                                        }
                                    </TransformComponent>
                                </div>
                            )}
                        </TransformWrapper>
                    </Col>
                </Row>
                {
                    showDetails ? (
                        <Row className='g-2'>
                            {
                                Object.keys(averageConfidencePerClass).length > 0 ? (
                                    <Col>
                                        <PerformanceBox title='Confidence' minHeight={50} data={Object.entries(averageConfidencePerClass).map(([label, value]) => ({label, value}))} />
                                    </Col>
                                ) : null
                            }
                            <Col xs={12}>
                                <hr />
                                <RenderDatapoint datapoint={datapoint} />
                            </Col>
                        </Row>
                    ) : null
                }
            </>
        );
    }
    case 'TEXT': {

        return (
            <Row onClick={onClick} className='g-2 overflow-auto my-2' style={{maxHeight: maxHeight || '100%'}}>
                <Col>
                    <div className='badge' style={{backgroundColor: theme.secondary}}>
                        prompt
                    </div>
                    <pre style={{whiteSpace: 'break-spaces'}}>{datapoint['text']}</pre>
                </Col>
                {groundtruths.length ? <hr/> : null}
                {
                    groundtruths?.map((g, i) => (
                        <Col key={i} as={Row} className='g-2'>
                            {g['completions']?.map((c, i) => (
                                <Col key={i} xs={12}>
                                    <div className='badge' style={{backgroundColor: theme.secondary}}>
                                            ground truth
                                    </div>
                                    <pre style={{whiteSpace: 'break-spaces'}}>{c['text']}</pre>
                                </Col>
                            ))}
                        </Col>
                    ))
                }
                {predictions.length ? <hr/> : null}
                {
                    predictions?.map((p, i) => (
                        <Col xs={12} key={i} as={Row} className='g-2'>
                            {p['completions']?.map((c, i) => (
                                <Col key={i} xs={12}>
                                    <div className='badge' style={{backgroundColor: getHexColor(p['model_name'])}}>
                                            model name: {p['model_name']}
                                    </div>
                                    <pre style={{whiteSpace: 'break-spaces'}}>{c['text']}</pre>
                                    <div>
                                        <RenderDatapoint datapoint={{
                                            confidence: c['confidence'],
                                            metrics: c['metrics']
                                        }} />
                                    </div>
                                </Col>
                            ))}
                        </Col>
                    ))
                }
            </Row>
        );
    }
    default:
        return <RenderDatapoint datapoint={datapoint} />;
    }
};

Datapoint.propTypes = {
    datapoint: PropTypes.object,
    maxHeight: PropTypes.number,
    onClick: PropTypes.func,
    showDetails: PropTypes.bool,
    zoomable: PropTypes.bool
};

export default Datapoint;
