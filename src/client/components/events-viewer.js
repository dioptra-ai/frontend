import PropTypes from 'prop-types';
import {useEffect, useRef, useState} from 'react';
import Alert from 'react-bootstrap/Alert';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import {GrNext, GrPrevious} from 'react-icons/gr';
import {IoCloseOutline} from 'react-icons/io5';
import {BsTags} from 'react-icons/bs';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import {mod} from 'helpers/math';
import {datapointIsImage, datapointIsText, datapointIsVideo, labelsAreLearningToRank, labelsAreNER} from 'helpers/datapoint';
import Modal from 'components/modal';
import PreviewImage from 'components/preview-image';
import PreviewTextClassification from 'components/preview-text-classification';
import PreviewDetails from 'components/preview-details';
import PreviewNER from './preview-ner';
import PreviewLearningToRank from './preview-learning-to-rank';
import {useInView} from 'react-intersection-observer';

import metricsClient from 'clients/metrics';

const useLabels = (datapoint) => {
    const {prediction, groundtruth, text} = datapoint;
    const {ref, inView} = useInView();
    const [requestlabels, setRequestLabels] = useState(null);
    const labels = (prediction || groundtruth) ? [{prediction, groundtruth, text}] : requestlabels;
    const requestControllerRef = useRef();

    useEffect(() => {
        if (!prediction && !groundtruth && datapoint.request_id) {
            if (requestControllerRef.current) {
                requestControllerRef.current.abort();
            }

            if (inView) {
                setRequestLabels(null);
                requestControllerRef.current = new AbortController();

                // TODO: Only display labels for datapoint rows, not label rows.
                (async () => {
                    try {
                        let datapoints = await metricsClient('select', {
                            select: '"prediction", "groundtruth", "tags", "text"',
                            filters: [{
                                left: 'uuid',
                                op: '=',
                                right: datapoint.uuid
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
                        }, true, {signal: requestControllerRef.current.signal});

                        if (!datapoints.length) {
                            datapoints = await metricsClient('select', {
                                select: '"prediction", "groundtruth", "tags", "text"',
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
                            }, true, {signal: requestControllerRef.current.signal});
                        }

                        setRequestLabels(datapoints);
                    } catch (err) {

                        if (err.name !== 'AbortError') {
                            console.error(err);
                        }
                    }
                })();
            }
        }
    }, [inView, datapoint]);

    return {loadWhenRefInView: ref, labels};
};

const EventType = ({datapoint: {prediction, groundtruth}, size = 4}) => (
    (prediction || groundtruth) ? (
        <OverlayTrigger overlay={<Tooltip>This is an annotation</Tooltip>}>
            <div className={`text-muted d-flex fs-${size}`} style={{cursor: 'help'}}><BsTags /></div>
        </OverlayTrigger>
    ) : null
);

EventType.propTypes = {
    size: PropTypes.number,
    datapoint: PropTypes.object
};

const DatapointPreview = ({datapoint, displayDetails, ...rest}) => {
    const {loadWhenRefInView, labels} = useLabels(datapoint);

    if (datapointIsVideo(datapoint) || datapointIsImage(datapoint)) {

        return (
            <div ref={loadWhenRefInView}>
                <PreviewImage
                    datapoint={datapoint}
                    videoControls={false}
                    maxHeight={200}
                    labels={labels}
                    displayDetails={displayDetails}
                    {...rest}
                />
            </div>
        );
    } else if (labelsAreNER(labels)) {

        return (
            <div ref={loadWhenRefInView}>
                <PreviewNER datapoint={datapoint} labels={labels} {...rest}/>
            </div>
        );
    } else if (datapointIsText(datapoint)) {

        // FIXME: Why is this always false?
        if (labelsAreLearningToRank(labels)) {

            return (
                <div ref={loadWhenRefInView}>
                    <PreviewLearningToRank datapoint={datapoint} labels={labels} displayDetails={displayDetails} {...rest} />
                </div>
            );
        } else {

            return (
                <div ref={loadWhenRefInView}>
                    <PreviewTextClassification datapoint={datapoint} labels={labels} {...rest} />
                </div>
            );
        }
    } else {

        return (
            <div ref={loadWhenRefInView}>
                <PreviewDetails datapoint={datapoint} labels={labels} displayDetails={displayDetails} {...rest}/>
            </div>
        );
    }
};

DatapointPreview.propTypes = {
    datapoint: PropTypes.object.isRequired,
    displayDetails: PropTypes.bool
};

const EventsViewer = ({events, onSelectedUUIDsChange, onSelectedChange, onClearDatapoint, limit = Infinity, renderButtons}) => {
    const selectAllRef = useRef();
    const [datapointIndexInModal, setDatapointIndexInModal] = useState(-1);
    const [selectedDatapoints, setSelectedDatapoints] = useState(new Set());
    const exampleInModal = events[datapointIndexInModal];
    const datapointsByUUID = new Map(events.map((d) => [d.uuid, d]));
    const annotationsNum = events.filter((d) => d.prediction || d.groundtruth).length;
    const datapointNums = events.length - annotationsNum;

    const handleSelectDatapoint = (uuid, selected) => {
        const newSet = new Set(selectedDatapoints);

        if (selected) {
            newSet.add(uuid);
        } else {
            newSet.delete(uuid);
        }
        setSelectedDatapoints(newSet);
        onSelectedUUIDsChange?.(newSet);
        onSelectedChange?.(Array.from(newSet).map((uuid) => datapointsByUUID.get(uuid)));
    };
    const handleSelectAll = (selected) => {
        let newSet = null;

        if (selected) {
            newSet = new Set(events.map(({uuid}) => uuid));
        } else {
            newSet = new Set();
        }
        setSelectedDatapoints(newSet);
        onSelectedUUIDsChange?.(newSet);
        onSelectedChange?.(Array.from(newSet).map((uuid) => datapointsByUUID.get(uuid)));
    };
    const handleKeyDown = (e) => {
        if (exampleInModal) {

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handlePrevious();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleNext();
            }
        }
    };
    const handlePrevious = () => {
        setDatapointIndexInModal(mod(datapointIndexInModal - 1, events.length));
    };
    const handleNext = () => {
        setDatapointIndexInModal(mod(datapointIndexInModal + 1, events.length));
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [datapointIndexInModal]);

    useEffect(() => {
        setSelectedDatapoints(new Set(events.filter((d) => selectedDatapoints.has(d['uuid'])).map((d) => d['uuid'])));
    }, [events]);

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = (selectedDatapoints.size && selectedDatapoints.size !== events.length);
            selectAllRef.current.checked = (events.length && selectedDatapoints.size === events.length);
        }
    }, [selectedDatapoints, events]);

    return (
        <>
            {
                (onSelectedUUIDsChange || onSelectedChange) && (
                    <div className='ps-2 pb-2 d-flex align-items-center' >
                        <Form.Check id='select-all' ref={selectAllRef} type='checkbox' onChange={(e) => {
                            handleSelectAll(e.target.checked);
                        }} label={<span className='cursor-pointer text-decoration-underline'>Select {[
                            datapointNums ? `${datapointNums} datapoints` : '',
                            annotationsNum ? `${annotationsNum} annotations` : ''
                        ].filter(Boolean).join(' and ')}</span>} />
                        &nbsp;&nbsp;&nbsp;
                        {renderButtons?.()}
                    </div>
                )
            }
            {
                events.length >= limit ? (
                    <Row>
                        <Col>
                            <Alert variant='warning'>
                                Only the first {limit.toLocaleString()} items are shown. Try filtering down or choosing different parameters.
                            </Alert>
                        </Col>
                    </Row>
                ) : null
            }
            <Row className='g-2'>
                {events.length ? events.slice(0, limit).map((datapoint, i) => {
                    const selectOrClearBar = (
                        <div className='d-flex justify-content-between pb-1'>
                            {(onSelectedUUIDsChange || onSelectedChange) && (
                                <Form.Check type='checkbox'
                                    onChange={(e) => handleSelectDatapoint(datapoint['uuid'], e.target.checked)}
                                    checked={selectedDatapoints.has(datapoint['uuid'])}
                                />
                            )}
                            <div className='d-flex align-items-center'>
                                <EventType datapoint={datapoint} />
                                {onClearDatapoint ?
                                    <IoCloseOutline className='cursor-pointer fs-4' onClick={() => onClearDatapoint(datapoint['uuid'])} /> :
                                    null}
                            </div>
                        </div>
                    );

                    return (
                        <Col key={`${JSON.stringify(datapoint)}-${i}`} xs={4} md={3} lg={2}>
                            <div className='p-2 bg-white-blue border rounded' >
                                {selectOrClearBar}
                                <DatapointPreview
                                    datapoint={datapoint}
                                    onClick={() => setDatapointIndexInModal(i)}
                                />
                            </div>
                        </Col>
                    );
                }) : (
                    <h3 className='text-secondary my-5 text-center' key='nope'>No Data</h3>
                )}
            </Row>
            {exampleInModal && (
                <Modal isOpen={true} onClose={() => setDatapointIndexInModal(-1)} title={
                    <div className='d-flex align-items-center justify-content-between'>
                        {(onSelectedUUIDsChange || onSelectedChange) ? (
                            <div className='ps-2'>
                                <Form.Check type='checkbox'
                                    onChange={(e) => handleSelectDatapoint(exampleInModal['uuid'], e.target.checked)}
                                    checked={selectedDatapoints.has(exampleInModal['uuid'])}
                                />
                            </div>
                        ) : <div/>}
                        <div className='align-self-end'>
                            <EventType datapoint={exampleInModal} size={3}/>
                        </div>
                    </div>
                }>
                    <div className='d-flex'>
                        <div className='fs-1 p-4 bg-white-blue cursor-pointer d-flex align-items-center mx-2' onClick={handlePrevious}>
                            <GrPrevious/>
                        </div>
                        <div>
                            <DatapointPreview
                                datapoint={exampleInModal}
                                videoControls
                                maxHeight={600}
                                zoomable
                                displayDetails
                            />
                        </div>
                        <div className='fs-1 p-4 bg-white-blue cursor-pointer d-flex align-items-center mx-2' onClick={handleNext}>
                            <GrNext/>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

EventsViewer.propTypes = {
    events: PropTypes.array.isRequired,
    onSelectedUUIDsChange: PropTypes.func,
    onSelectedChange: PropTypes.func,
    onClearDatapoint: PropTypes.func,
    limit: PropTypes.number,
    renderButtons: PropTypes.func
};

export default EventsViewer;
