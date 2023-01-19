import Modal from 'components/modal';
import PropTypes from 'prop-types';
import {useState} from 'react';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import {IoArrowBackCircleOutline, IoCloseCircleOutline} from 'react-icons/io5';
import EventsViewerWithButtons from 'components/events-viewer-with-buttons';

const ArrayLabelsExamples = ({onClose, groundtruth, prediction}) => {
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
                >
                    {exampleInModal ? <IoArrowBackCircleOutline /> : <IoCloseCircleOutline />}
                </button>
            )}
        >
            {exampleInModal ? (
                <pre className='m-0'>{
                    JSON.stringify(
                        Object.keys(exampleInModal).filter((k) => exampleInModal[k])
                            .reduce((agg, k) => ({
                                ...agg,
                                [k]: exampleInModal[k]
                            }), {}),
                        null, 4
                    )}</pre>
            ) : (
                <Async
                    renderData={(samples) => {

                        return <EventsViewerWithButtons samples={samples} />;
                    }}
                    fetchData={() => metricsClient('queries/array-labels-examples', {
                        groundtruth,
                        prediction,
                        sql_filters: allSqlFilters
                    })}
                    refetchOnChanged={[groundtruth, prediction, allSqlFilters]}
                />
            )}
        </Modal>
    );
};

ArrayLabelsExamples.propTypes = {
    groundtruth: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    prediction: PropTypes.string.isRequired,
    previewColumns: PropTypes.string
};

export default ArrayLabelsExamples;
