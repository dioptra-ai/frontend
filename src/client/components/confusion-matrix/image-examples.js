import PropTypes from 'prop-types';
import {useState} from 'react';
import Modal from 'components/modal';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import {IoArrowBackCircleOutline, IoCloseCircleOutline} from 'react-icons/io5';
import PreviewImage from 'components/preview-image';
import EventsViewerWithButtons from 'components/events-viewer-with-buttons';
import useAllFilters from 'hooks/use-all-filters';

const ImageExamples = ({onClose, groundtruth, prediction, iou, model}) => {
    const [exampleInModal, setExampleInModal] = useState(false);
    const allSqlFilters = useAllSqlFilters();
    const allFilters = useAllFilters();

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
                    <PreviewImage sample={exampleInModal} height={600} zoomable/>
                ) : (
                    <Async
                        renderData={(samples) => {

                            return (
                                <EventsViewerWithButtons samples={samples}/>
                            );
                        }}
                        refetchOnChanged={[groundtruth, prediction, iou, allSqlFilters, model.mlModelType]}
                        fetchData={() => metricsClient('select', {
                            select: '"image_metadata", "prediction", "groundtruth", "request_id", "uuid", "tags"',
                            filters: [...allFilters, {
                                left: 'prediction.class_name',
                                op: '=',
                                right: prediction
                            }, {
                                left: 'groundtruth.class_name',
                                op: '=',
                                right: groundtruth
                            }, ...((model.mlModelType === 'UNSUPERVISED_OBJECT_DETECTION' || model.mlModelType === 'OBJECT_DETECTION') ? [{
                                left: 'iou',
                                op: '>=',
                                right: iou
                            }] : [])]
                        })}
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
