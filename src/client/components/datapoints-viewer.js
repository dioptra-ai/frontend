import PropTypes from 'prop-types';
import {useEffect, useRef, useState} from 'react';
import Alert from 'react-bootstrap/Alert';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import {GrNext, GrPrevious} from 'react-icons/gr';
import {IoCloseOutline} from 'react-icons/io5';
import {mod} from 'helpers/math';
import {datapointIsImage, datapointIsNER, datapointIsText, datapointIsVideo} from 'helpers/datapoint';
import Modal from 'components/modal';
import PreviewImage from 'components/preview-image';
import PreviewTextClassification from 'components/preview-text-classification';
import PreviewDetails from 'components/preview-details';
import PreviewNER from './preview-ner';

const DatapointsViewer = ({datapoints, onSelectedChange, onClearDatapoint, limit = Infinity}) => {
    const selectAllRef = useRef();
    const [sampleIndexInModal, setSampleIndexInModal] = useState(-1);
    const [selectedDatapoints, setSelectedDatapoints] = useState(new Set());
    const exampleInModal = datapoints[sampleIndexInModal];

    const handleSelectDatapoint = (uuid, selected) => {
        const newSet = new Set(selectedDatapoints);

        if (selected) {
            newSet.add(uuid);
        } else {
            newSet.delete(uuid);
        }
        setSelectedDatapoints(newSet);
        onSelectedChange?.(newSet);
    };
    const handleSelectAll = (selected) => {
        let newSet = null;

        if (selected) {
            newSet = new Set(datapoints.map(({uuid}) => uuid));
        } else {
            newSet = new Set();
        }
        setSelectedDatapoints(newSet);
        onSelectedChange?.(newSet);
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
        setSelectedDatapoints(new Set(datapoints.filter((d) => selectedDatapoints.has(d['uuid'])).map((d) => d['uuid'])));
    }, [datapoints]);

    useEffect(() => {
        selectAllRef.current.indeterminate = (selectedDatapoints.size && selectedDatapoints.size !== datapoints.length);
        selectAllRef.current.checked = (datapoints.length && selectedDatapoints.size === datapoints.length);
    }, [selectedDatapoints, datapoints]);

    return (
        <>
            <Container fluid>
                {
                    datapoints.length >= limit ? (
                        <Row>
                            <Col>
                                <Alert variant='warning'>
                                Only the first {limit.toLocaleString()} datapoints are shown. Try filtering down or choosing different parameters.
                                </Alert>
                            </Col>
                        </Row>
                    ) : null
                }
                <Row className='ps-2'>
                    <Col>
                        <Form.Check id='select-all' ref={selectAllRef} type='checkbox' onChange={(e) => {
                            handleSelectAll(e.target.checked);
                        }} label={<span className='cursor-pointer text-decoration-underline'>Select All</span>}/>
                    </Col>
                </Row>
                <Row className='g-2'>
                    {datapoints.length ? datapoints.slice(0, limit).map((datapoint, i) => {
                        const selectOrClearBar = (
                            <div className='d-flex justify-content-between'>
                                <Form.Check type='checkbox'
                                    onChange={(e) => handleSelectDatapoint(datapoint['uuid'], e.target.checked)}
                                    checked={selectedDatapoints.has(datapoint['uuid'])}
                                />
                                {onClearDatapoint ?
                                    <IoCloseOutline className='cursor-pointer fs-4' onClick={() => onClearDatapoint(datapoint['uuid'])}/> :
                                    null}
                            </div>
                        );

                        if (datapointIsVideo(datapoint) || datapointIsImage(datapoint)) {

                            return (
                                <Col key={`${JSON.stringify(datapoint)}-${i}`} xs={6} md={4} lg={3}>
                                    <div className='p-2 bg-white-blue border rounded' >
                                        {selectOrClearBar}
                                        <PreviewImage
                                            datapoint={datapoint}
                                            videoControls={false}
                                            maxHeight={200}
                                            onClick={() => setSampleIndexInModal(i)}
                                        />
                                    </div>
                                </Col>
                            );
                        } else if (datapointIsText(datapoint)) {

                            if (datapointIsNER(datapoint)) {

                                return (
                                    <Col key={`${JSON.stringify(datapoint)}-${i}`} xs={6} md={4} xl={3}>
                                        <div className='p-2 bg-white-blue border rounded' >
                                            {selectOrClearBar}
                                            <PreviewNER
                                                sample={datapoint}
                                                onClick={() => setSampleIndexInModal(i)}
                                            />
                                        </div>
                                    </Col>
                                );
                            } else {

                                return (
                                    <Col key={`${JSON.stringify(datapoint)}-${i}`} xs={12}>
                                        <div className='p-2 border-bottom' >
                                            {selectOrClearBar}
                                            <PreviewTextClassification
                                                sample={datapoint}
                                                onClick={() => setSampleIndexInModal(i)}
                                            />
                                        </div>
                                    </Col>
                                );
                            }
                        } else return (
                            <Col key={`${JSON.stringify(datapoint)}-${i}`} xs={12}>
                                <div className='p-2 border-bottom' >
                                    {selectOrClearBar}
                                    <PreviewDetails sample={datapoint}/>
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
                            onChange={(e) => handleSelectDatapoint(exampleInModal['uuid'], e.target.checked)}
                            checked={selectedDatapoints.has(exampleInModal['uuid'])}
                        />
                    </div>
                }>
                    <div className='d-flex'>
                        <div className='fs-1 p-4 bg-white-blue cursor-pointer d-flex align-items-center mx-2' onClick={handlePrevious}>
                            <GrPrevious/>
                        </div>
                        <div>
                            {datapointIsImage(exampleInModal) || datapointIsVideo(exampleInModal) ? (
                                <>
                                    <PreviewImage
                                        datapoint={exampleInModal}
                                        videoControls
                                        maxHeight={600}
                                        zoomable
                                    />
                                    <hr/>
                                </>
                            ) : datapointIsText(exampleInModal) && datapointIsNER(exampleInModal) ? (
                                <>
                                    <PreviewNER
                                        sample={exampleInModal}
                                    />
                                    <hr/>
                                </>
                            ) : datapointIsText(exampleInModal) ? (
                                <>
                                    <PreviewTextClassification
                                        sample={exampleInModal}
                                    />
                                    <hr/>
                                </>
                            ) : null}
                            <PreviewDetails sample={exampleInModal}/>
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
    onSelectedChange: PropTypes.func,
    onClearDatapoint: PropTypes.func,
    limit: PropTypes.number
};

export default DatapointsViewer;
