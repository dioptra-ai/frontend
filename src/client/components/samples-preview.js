import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';
import {GrNext, GrPrevious} from 'react-icons/gr';
import {IoDownloadOutline} from 'react-icons/io5';
import {BsMinecartLoaded} from 'react-icons/bs';
import oHash from 'object-hash';
import {saveAs} from 'file-saver';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';

import useModal from 'hooks/useModal';
import {Filter} from 'state/stores/filters-store';
import Modal from 'components/modal';
import AddFilters from 'components/add-filters';
import MinerModal from 'components/miner-modal';
import FrameWithBoundingBox, {PreviewImageClassification} from 'components/preview-image-classification';
import {mod} from 'helpers/math';
import PreviewTextClassification from 'components/preview-text-classification';

const SamplesPreview = ({samples}) => {
    const [minerModalOpen, setMinerModalOpen] = useModal(false);
    const [sampleIndexInModal, setSampleIndexInModal] = useState(-1);

    const exampleInModal = samples[sampleIndexInModal];
    const sampleRequestIds = samples.map(({request_id}) => request_id);
    const examplesType = samples.every((s) => (/\.mp4$/).test(s)) ? 'video' : samples.every((s) => (/^https?:\/\//).test(s['image_metadata.uri'])) ? 'image' : 'text';

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
        setSampleIndexInModal(mod(sampleIndexInModal - 1, samples.length));
    };
    const handleNext = () => {
        setSampleIndexInModal(mod(sampleIndexInModal + 1, samples.length));
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [sampleIndexInModal]);

    return (
        <>
            <div className='text-dark m-0 bold-text d-flex justify-content-between'>
                <div>
                    {samples.length ? `Selected samples: ${samples.length}` : null}
                </div>
                <div>
                    <AddFilters
                        filters={[new Filter({
                            left: 'request_id',
                            op: 'in',
                            right: sampleRequestIds
                        })]}
                        tooltipText='Filter-in these examples'
                    />
                    <AddFilters
                        filters={[new Filter({
                            left: 'request_id',
                            op: 'not in',
                            right: sampleRequestIds
                        })]}
                        tooltipText='Filter-out these examples'
                        solidIcon
                    />
                    <OverlayTrigger overlay={<Tooltip>Download samples as JSON</Tooltip>}>
                        <button
                            className='text-dark border-0 bg-transparent click-down fs-2'
                            onClick={() => {

                                saveAs(new Blob([JSON.stringify(samples)], {type: 'application/json;charset=utf-8'}), 'samples.json');
                            }}>
                            <IoDownloadOutline className='fs-2 cursor-pointer'/>
                        </button>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={<Tooltip>Mine for Similar Datapoints</Tooltip>}>
                        <button
                            className='text-dark border-0 bg-transparent click-down fs-2' onClick={() => {
                                setMinerModalOpen(true);
                            }}>
                            <BsMinecartLoaded className='fs-2 ps-2 cursor-pointer'/>
                        </button>
                    </OverlayTrigger>
                </div>
            </div>
            <Container fluid>
                <Row className='g-2'>
                    {samples.length ? samples.map((sample, i) => {

                        if (examplesType === 'video') {

                            return (
                                <Col key={`${oHash(sample)}-${i}`} xs={6} md={4} xl={3}>
                                    <div className='p-2 bg-white-blue border rounded' >
                                        <FrameWithBoundingBox
                                            videoUrl={sample}
                                            videoControls={false}
                                            frameW={sample['image_metadata.width']}
                                            frameH={sample['image_metadata.height']}
                                            boxW={sample['image_metadata.object.width']}
                                            boxH={sample['image_metadata.object.height']}
                                            boxT={sample['image_metadata.object.top']}
                                            boxL={sample['image_metadata.object.left']}
                                            height={200}
                                            onClick={() => setSampleIndexInModal(i)}
                                        />
                                    </div>
                                </Col>
                            );
                        } else if (examplesType === 'image') {

                            return (
                                <Col key={`${oHash(sample)}-${i}`} xs={6} md={4} xl={3}>
                                    <div className='p-2 bg-white-blue border rounded' >
                                        <PreviewImageClassification
                                            sample={sample}
                                            height={200}
                                            onClick={() => setSampleIndexInModal(i)}
                                        />
                                    </div>
                                </Col>
                            );
                        } else if (examplesType === 'text') {

                            return (
                                <Col xs={12}>
                                    <div className='p-2 border-bottom' >
                                        <PreviewTextClassification
                                            sample={sample}
                                            onClick={() => setSampleIndexInModal(i)}
                                        />
                                    </div>
                                </Col>
                            );
                        } else return null;
                    }) : (
                        <h3 className='text-secondary m-0' key='nope'>No Data</h3>
                    )}
                </Row>
            </Container>
            {exampleInModal && (
                <Modal isOpen={true} onClose={() => setSampleIndexInModal(-1)} title=''>
                    <div className='d-flex'>
                        <div className='fs-1 p-4 bg-white-blue cursor-pointer d-flex align-items-center mx-2' onClick={handlePrevious}>
                            <GrPrevious/>
                        </div>
                        <div>
                            {examplesType === 'image' ? (
                                <>
                                    <PreviewImageClassification
                                        sample={exampleInModal}
                                        height={600}
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
                                        height={600}
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
            <MinerModal isOpen={minerModalOpen} onClose={() => setMinerModalOpen(false)} requestIds={samples.map((p) => p['request_id'])}/>
        </>
    );
};

SamplesPreview.propTypes = {
    samples: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default SamplesPreview;
