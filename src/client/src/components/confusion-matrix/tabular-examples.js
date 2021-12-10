import Modal from 'components/modal';
import PropTypes from 'prop-types';
import {IconNames} from 'constants';
import BtnIcon from 'components/btn-icon';
import useModal from 'customHooks/useModal';
import Table from 'components/table';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import Async from 'components/async';
import metricsClient from 'clients/metrics';

const TabularExamples = ({onClose, groundtruth, prediction, previewColumns}) => {
    const [exampleInModal, setExampleInModal] = useModal(false);
    const allSqlFilters = useAllSqlFilters();

    return (
        <div className='bg-white-blue my-3 p-3'>
            <div className='d-flex align-items-center mb-5'>
                <p className='text-dark m-0 bold-text flex-grow-1'>Examples</p>
                <BtnIcon
                    className='text-dark border-0'
                    icon={IconNames.CLOSE}
                    onClick={onClose}
                    size={15}
                />
            </div>
            <div className='overflow-auto'>
                <Async
                    defaultData={[]}
                    renderData={(data) => {
                        const allColumns = Object.keys(data[0]);
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
                    fetchData={() => metricsClient('query/all_tabular_examples', {
                        groundtruth,
                        prediction,
                        sql_filters: allSqlFilters
                    })}
                />
            </div>
            {exampleInModal && (
                <Modal isOpen={true} onClose={() => setExampleInModal(null)}>
                    <div className='d-flex align-items-center'>
                        <p className='m-0 flex-grow-1'></p>
                        <BtnIcon
                            className='border-0'
                            icon={IconNames.CLOSE}
                            onClick={() => setExampleInModal(null)}
                            size={15}
                        />
                    </div>
                    <pre className='m-0'>{
                        JSON.stringify(
                            Object.keys(exampleInModal).filter((k) => exampleInModal[k])
                                .reduce((agg, k) => ({
                                    ...agg,
                                    [k]: exampleInModal[k]
                                }), {}),
                            null, 4
                        )}</pre>
                </Modal>
            )}
        </div>

    );
};

TabularExamples.propTypes = {
    groundtruth: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    prediction: PropTypes.string.isRequired,
    previewColumns: PropTypes.string
};

export default TabularExamples;
