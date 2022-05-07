import PropTypes from 'prop-types';
import {useState} from 'react';
import Modal from 'components/modal';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import TabularExamples from './tabular-examples';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import {IoArrowBackCircleOutline, IoCloseCircleOutline} from 'react-icons/io5';
import AddFilters from 'components/add-filters';
import {Filter} from 'state/stores/filters-store';
import {ImageClassificationFrameWithBoundingBox} from 'components/frame-with-bounding-box';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const ImageExamples = ({onClose, groundtruth, prediction, iou, model}) => {
    const [exampleInModal, setExampleInModal] = useState(false);
    const allSqlFilters = useAllSqlFilters();

    return (
        <Modal isOpen onClose={onClose} title='Examples'
            closeButton={(
                <button
                    className='text-dark border-0 bg-white fs-2'
                    onClick={() => {
                        if (exampleInModal) {
                            setExampleInModal(null);
                        } else {
                            onClose();
                        }
                    }}
                >{
                        exampleInModal ? <IoArrowBackCircleOutline/> : <IoCloseCircleOutline/>
                    }</button>
            )}
        >
            <div className={`d-flex flex-column ${exampleInModal ? 'align-items-center' : 'align-items-end'}`} style={{width: '80vw'}}>
                {exampleInModal ? (
                    <ImageClassificationFrameWithBoundingBox sample={exampleInModal} height={600} zoomable/>
                ) : (
                    <Async
                        renderData={(data) => {

                            if (data.every((d) => d['image_metadata.uri'].replace(/"/g, '').match(/^https?:\/\//))) {

                                return (
                                    <>
                                        <AddFilters
                                            filters={[
                                                new Filter({
                                                    left: 'request_id',
                                                    op: 'in',
                                                    right: data.map(
                                                        (d) => d['request_id']
                                                    )
                                                })
                                            ]}
                                        />
                                        <Container>
                                            <Row>
                                                {data.map((sample, i) => (
                                                    <Col
                                                        className='mt-2 rounded cursor-pointer'
                                                        key={i}
                                                        xs={4}
                                                        md={2}
                                                    >
                                                        <ImageClassificationFrameWithBoundingBox
                                                            height={200}
                                                            sample={sample}
                                                            onClick={() => setExampleInModal(sample)}
                                                        />
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Container>
                                    </>
                                );
                            } else {

                                return (
                                    <>
                                        <AddFilters filters={[new Filter({
                                            left: 'request_id',
                                            op: 'in',
                                            right: data.map((d) => d['request_id'])
                                        })]}/>
                                        <TabularExamples
                                            groundtruth={groundtruth}
                                            onClose={onClose}
                                            prediction={prediction}
                                            previewColumns={['confidence', 'groundtruth', 'prediction', 'tags', /^text$/, 'features']}
                                        />
                                    </>
                                );
                            }
                        }}
                        refetchOnChanged={[groundtruth, prediction, iou, allSqlFilters, model.mlModelType]}
                        fetchData={() => metricsClient(`queries/${model.mlModelType === 'DOCUMENT_PROCESSING' || model.mlModelType === 'UNSUPERVISED_OBJECT_DETECTION' ?
                            'select-samples-for-document-processing' : 'select-samples-for-default'}`,
                        model.mlModelType === 'DOCUMENT_PROCESSING' || model.mlModelType === 'UNSUPERVISED_OBJECT_DETECTION' ?
                            {
                                groundtruth,
                                prediction,
                                iou,
                                sql_filters: allSqlFilters
                            } :
                            {
                                groundtruth,
                                prediction,
                                sql_filters: allSqlFilters
                            })
                        }
                    />)
                }
            </div>
        </Modal>
    );
};

ImageExamples.propTypes = {
    groundtruth: PropTypes.string.isRequired,
    iou: PropTypes.number,
    model: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    prediction: PropTypes.string.isRequired
};

export default ImageExamples;
