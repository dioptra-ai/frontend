import PropTypes from 'prop-types';
import {useState} from 'react';
import Modal from 'components/modal';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import {IoArrowBackCircleOutline, IoCloseCircleOutline} from 'react-icons/io5';
import {PreviewImageClassification} from 'components/preview-image';
import SamplesPreview from 'components/samples-preview';

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
                    <PreviewImageClassification sample={exampleInModal} height={600} zoomable/>
                ) : (
                    <Async
                        renderData={(samples) => {

                            return (
                                <SamplesPreview samples={samples}/>
                            );
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
