import PropTypes from 'prop-types';
import {useEffect, useRef, useState} from 'react';
import oHash from 'object-hash';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import {GrNext, GrPrevious} from 'react-icons/gr';

import {mod} from 'helpers/math';
import Modal from 'components/modal';
import FrameWithBoundingBox, {PreviewImageClassification} from 'components/preview-image-classification';
import PreviewTextClassification from 'components/preview-text-classification';

const DatapointsViewer = ({datapoints, onSelectedChange}) => {
    const selectAllRef = useRef();
    const [sampleIndexInModal, setSampleIndexInModal] = useState(-1);
    const [selectedDatapoints, setSelectedDatapoints] = useState(new Set());
    const handleSelectDatapoint = (i, selected) => {
        const newSet = new Set(selectedDatapoints);

        if (selected) {
            newSet.add(i);
        } else {
            newSet.delete(i);
        }
        setSelectedDatapoints(newSet);
        onSelectedChange?.(newSet);
    };
    const handleSelectAll = (selected) => {
        let newSet = null;

        if (selected) {
            newSet = new Set(Array(datapoints.length).fill().map((_, i) => i));
        } else {
            newSet = new Set();
        }
        setSelectedDatapoints(newSet);
        onSelectedChange?.(newSet);
    };

    const exampleInModal = datapoints[sampleIndexInModal];
    const examplesType = datapoints.every((s) => (/\.mp4$/).test(s)) ? 'video' : datapoints.every((s) => (/^https?:\/\//).test(s['image_metadata.uri'])) ? 'image' : 'text';

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            handlePrevious();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            handleNext();
        }
    };

    const handlePrevious = () => {
        setSampleIndexInModal(mod(sampleIndexInModal - 1, datapoints.length));
    };
    const handleNext = () => {
        setSampleIndexInModal(mod(sampleIndexInModal + 1, datapoints.length));
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [sampleIndexInModal]);

    useEffect(() => {
        selectAllRef.current.indeterminate = (selectedDatapoints.size !== 0 && selectedDatapoints.size !== datapoints.length);
    }, [selectedDatapoints.size]);

    return (
        <>
            <Container fluid>
                <Row className='ps-2'>
                    <Col>
                        <Form.Check id='select-all' ref={selectAllRef} type='checkbox' onChange={(e) => {
                            handleSelectAll(e.target.checked);
                        }} label='Select All'/>
                    </Col>
                </Row>
                <Row className='g-2'>
                    {datapoints.length ? datapoints.map((datapoint, i) => {

                        if (examplesType === 'video') {

                            return (
                                <Col key={`${oHash(datapoint)}-${i}`} xs={6} md={4} xl={3}>
                                    <div className='p-2 bg-white-blue border rounded' >
                                        <Form.Check type='checkbox' onChange={(e) => handleSelectDatapoint(i, e.target.checked)} checked={selectedDatapoints.has(i)}/>
                                        <FrameWithBoundingBox
                                            videoUrl={datapoint}
                                            videoControls={false}
                                            frameW={datapoint['image_metadata.width']}
                                            frameH={datapoint['image_metadata.height']}
                                            boxW={datapoint['image_metadata.object.width']}
                                            boxH={datapoint['image_metadata.object.height']}
                                            boxT={datapoint['image_metadata.object.top']}
                                            boxL={datapoint['image_metadata.object.left']}
                                            maxHeight={200}
                                            onClick={() => setSampleIndexInModal(i)}
                                        />
                                    </div>
                                </Col>
                            );
                        } else if (examplesType === 'image') {

                            return (
                                <Col key={`${oHash(datapoint)}-${i}`} xs={6} md={4} xl={3}>
                                    <div className='p-2 bg-white-blue border rounded' >
                                        <Form.Check type='checkbox' onChange={(e) => handleSelectDatapoint(i, e.target.checked)} checked={selectedDatapoints.has(i)}/>
                                        <PreviewImageClassification
                                            sample={datapoint}
                                            maxHeight={200}
                                            onClick={() => setSampleIndexInModal(i)}
                                        />
                                    </div>
                                </Col>
                            );
                        } else if (examplesType === 'text') {

                            return (
                                <Col key={`${oHash(datapoint)}-${i}`} xs={12}>
                                    <div className='p-2 border-bottom' >
                                        <Form.Check type='checkbox' onChange={(e) => handleSelectDatapoint(i, e.target.checked)} checked={selectedDatapoints.has(i)}/>
                                        <PreviewTextClassification
                                            sample={datapoint}
                                            onClick={() => setSampleIndexInModal(i)}
                                        />
                                    </div>
                                </Col>
                            );
                        } else return (
                            <Col key={`${oHash(datapoint)}-${i}`} xs={12}>
                                <div className='p-2 border-bottom' >
                                    <Form.Check type='checkbox' onChange={(e) => handleSelectDatapoint(i, e.target.checked)} checked={selectedDatapoints.has(i)}/>
                                    {JSON.stringify(datapoint)}
                                </div>
                            </Col>
                        );
                    }) : (
                        <h3 className='text-secondary my-5 text-center' key='nope'>No Data</h3>
                    )}
                </Row>
            </Container>
            {exampleInModal && (
                <Modal isOpen={true} onClose={() => setSampleIndexInModal(-1)} title={
                    <div className='ps-2'>
                        <Form.Check type='checkbox'
                            onChange={(e) => handleSelectDatapoint(sampleIndexInModal, e.target.checked)}
                            checked={selectedDatapoints.has(sampleIndexInModal)}
                        />
                    </div>
                }>
                    <div className='d-flex'>
                        <div className='fs-1 p-4 bg-white-blue cursor-pointer d-flex align-items-center mx-2' onClick={handlePrevious}>
                            <GrPrevious/>
                        </div>
                        <div>
                            {examplesType === 'image' ? (
                                <>
                                    <PreviewImageClassification
                                        sample={exampleInModal}
                                        maxHeight={600}
                                        zoomable
                                    />
                                    <hr/>
                                </>
                            ) : examplesType === 'video' ? (
                                <>
                                    <FrameWithBoundingBox
                                        videoUrl={exampleInModal}
                                        videoControls
                                        frameW={exampleInModal['image_metadata.width']}
                                        frameH={exampleInModal['image_metadata.height']}
                                        boxW={exampleInModal['image_metadata.object.width']}
                                        boxH={exampleInModal['image_metadata.object.height']}
                                        boxT={exampleInModal['image_metadata.object.top']}
                                        boxL={exampleInModal['image_metadata.object.left']}
                                        maxHeight={600}
                                        zoomable
                                    />
                                    <hr/>
                                </>
                            ) : null}
                            <Container fluid>
                                {
                                    Object.keys(exampleInModal).map((k) => (
                                        <Row key={k}>
                                            <Col xs={4}>{k}</Col>
                                            <Col className='text-break'>{exampleInModal[k]}</Col>
                                        </Row>
                                    ))
                                }
                            </Container>
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

DatapointsViewer.propTypes = {
    datapoints: PropTypes.array.isRequired,
    onSelectedChange: PropTypes.func
};

export default DatapointsViewer;
