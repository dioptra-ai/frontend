import PropTypes from 'prop-types';
import {useState} from 'react';
import CustomCarousel from 'components/carousel';
import Modal from 'components/modal';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import TabularExamples from './tabular-examples';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import AddFilters from 'components/add-filters';
import {IoArrowBackCircleOutline, IoCloseCircleOutline} from 'react-icons/io5';
import {Filter} from 'state/stores/filters-store';

const ImageExamples = ({onClose, groundtruth, prediction, iou, model}) => {
    const [exampleInModal, setExampleInModal] = useState(false);
    const allSqlFilters = useAllSqlFilters();

    return (
        <Modal isOpen onClose={onClose} title='Examples'
            closeButton={(
                <>
                    <AddFilters filters={[new Filter({
                        key: 'groundtruth', op: '=', value: groundtruth
                    }), new Filter({
                        key: 'prediction', op: '=', value: prediction
                    })]}/>
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
                </>
            )}
        >
            <div className='p-3'>
                {exampleInModal ? (
                    <img
                        alt='Example'
                        className='rounded modal-image'
                        style={{maxWidth: '80vw', maxHeight: '75vh'}}
                        src={exampleInModal}
                    />
                ) : (
                    <Async
                        renderData={(data) => data.every((img) => img['image_metadata.uri'].replace(/"/g, '').match(/^https?:\/\//)) ? (
                            <CustomCarousel
                                items={data.map((x) => x['image_metadata.uri'].replace(/"/g, ''))}
                                onItemClick={setExampleInModal}
                            />
                        ) : (
                            <TabularExamples
                                groundtruth={groundtruth}
                                onClose={onClose}
                                prediction={prediction}
                            />
                        )
                        }
                        refetchOnChanged={[groundtruth, prediction, iou, allSqlFilters, model.mlModelType]}
                        fetchData={() => metricsClient(`queries/${model.mlModelType === 'DOCUMENT_PROCESSING' ?
                            'select-image-uri-for-data-processing' : 'select-image-uri-for-default'}`,
                        model.mlModelType === 'DOCUMENT_PROCESSING' ?
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
