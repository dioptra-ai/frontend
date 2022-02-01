import Modal from 'components/modal';
import PropTypes from 'prop-types';
import {useState} from 'react';
import Table from 'components/table';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import {IoArrowBackCircleOutline, IoCloseCircleOutline} from 'react-icons/io5';

const TabularExamples = ({onClose, groundtruth, prediction, previewColumns}) => {
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
                    {exampleInModal ? <IoArrowBackCircleOutline/> : <IoCloseCircleOutline/>}
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
                    renderData={(data) => {
                        const allColumns = Object.keys(data[0] || {});
                        const nonEmptyColumns = allColumns
                            .filter((c) => {
                                if (previewColumns) {
                                    return previewColumns.some((p) => c.match(p));
                                } else return true;
                            })
                            .filter((column) => {
                                return (
                                    column !== '__time' &&
                                    data.some((d) => d[column])
                                );
                            });

                        return (
                            <Table
                                columns={nonEmptyColumns.map((column) => ({
                                    accessor: (c) => c[column],
                                    Header: column
                                }))}
                                data={data}
                                getRowProps={(row) => ({
                                    onClick: setExampleInModal.bind(null, row.original),
                                    className: 'cursor-pointer hover'
                                })}
                            />
                        );
                    }}
                    fetchData={() => metricsClient('queries/all_tabular_examples', {
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

TabularExamples.propTypes = {
    groundtruth: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    prediction: PropTypes.string.isRequired,
    previewColumns: PropTypes.string
};

export default TabularExamples;
