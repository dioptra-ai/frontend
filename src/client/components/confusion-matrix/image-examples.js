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
import SignedImage from 'components/signed-image';
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
            <div className='d-flex flex-column align-items-end'>
                {exampleInModal ? (
                    <img
                        alt='Example'
                        className='rounded modal-image'
                        style={{maxWidth: '80vw', maxHeight: '75vh'}}
                        src={exampleInModal}
                    />
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
                                                {data.map((item, i) => (
                                                    <Col
                                                        className='mt-2 rounded cursor-pointer'
                                                        key={i}
                                                        onClick={() => setExampleInModal(item.signedUrl)}
                                                        xs={4}
                                                        md={2}
                                                    >
                                                        <SignedImage
                                                            rawUrl={item['image_metadata.uri'].replace(/"/g, '')}
                                                            setSignedUrlCallback={(signedUrl) => { item.signedUrl = signedUrl }}
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
