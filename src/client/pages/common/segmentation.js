/* eslint-disable max-lines */
import {useInView} from 'react-intersection-observer';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import Collapse from 'react-bootstrap/Collapse';
import {IoChevronDownSharp, IoChevronForwardSharp} from 'react-icons/io5';
import {
    Bar,
    BarChart,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis
} from 'recharts';
import Alert from 'react-bootstrap/Alert';

import useModel from 'hooks/use-model';
import {setupComponent} from 'helpers/component-helper';
import Button from 'react-bootstrap/Button';
import FontIcon from 'components/font-icon';
import {IconNames, isNaN} from 'constants';
import Table from 'components/table';
import Modal from 'components/modal';
import useModal from 'hooks/useModal';
import {getHexColor} from 'helpers/color-helper';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import Async from 'components/async';
import AsyncSegmentationFields from 'components/async-segmentation-fields';
import metricsClient from 'clients/metrics';
import useAllFilters from 'hooks/use-all-filters';

const AddColumnModal = ({onApply, allColumns, initiallyselected}) => {
    const [selectedColumns, setSelectedColumns] = useState(initiallyselected.filter((c) => allColumns.includes(c)));
    const [openSections, setOpenSections] = useState([]);
    const columnsBySection = allColumns.reduce((acc, col) => {
        const section = col.split('.')[0];

        if (acc[section]) {
            acc[section].push(col);
        } else {
            acc[section] = [col];
        }

        return acc;
    }, {});

    const handleChange = (e, col) => {
        if (e.target.checked) {
            setSelectedColumns([...selectedColumns, col]);
        } else {
            const updatedCols = selectedColumns.filter((c) => c !== col);

            setSelectedColumns(updatedCols);
        }
    };

    return (
        <>
            {allColumns.length > 0 && (
                <div className='d-flex flex-column mb-4'>
                    {
                        Object.keys(columnsBySection).map((section) => (
                            <div key={section}>
                                <a className='text-dark fw-bold fs-6' onClick={() => {
                                    if (openSections.includes(section)) {
                                        setOpenSections(openSections.filter((s) => s !== section));
                                    } else {
                                        setOpenSections([...openSections, section]);
                                    }
                                }}>
                                    {section || 'Other Columns'}{openSections.includes(section) ? <IoChevronDownSharp/> : <IoChevronForwardSharp/>}
                                </a>
                                <Collapse in={openSections.includes(section)}>
                                    <div>
                                        {columnsBySection[section].map((column, i) => (
                                            <label className='checkbox my-2 fs-6' key={i}>
                                                <input
                                                    defaultChecked={selectedColumns.includes(column)}
                                                    onChange={(e) => handleChange(e, column)}
                                                    type='checkbox'
                                                />
                                                <span className='fs-6'>{column}</span>
                                            </label>
                                        ))}
                                    </div>
                                </Collapse>
                            </div>
                        ))
                    }
                </div>
            )}
            <div className='border-top border-mercury py-3'>
                <Button
                    className='text-white fw-bold fs-6 px-5 py-2'
                    onClick={() => onApply(selectedColumns)}
                    variant='primary'
                >
          APPLY
                </Button>
            </div>
        </>
    );
};

AddColumnModal.propTypes = {
    allColumns: PropTypes.array,
    onApply: PropTypes.func,
    initiallyselected: PropTypes.array
};

const _DistributionCell = ({row, segmentationStore}) => {
    const groupByColumns = segmentationStore.segmentation;
    const {ref, inView} = useInView();
    const {mlModelType} = useModel();
    const allSqlFilters = useAllSqlFilters();
    const allFilters = useAllFilters();
    const [distributionData, setDistributionData] = useState([]);
    const sqlColumns = groupByColumns.join(', ');

    useEffect(() => {
        if (inView) {
            metricsClient('queries/distribution-data', {
                sql_columns: sqlColumns,
                filters: [...allFilters, ...groupByColumns.map((c) => ({left: c, op: '=', right: row.original[c]}))],
                columns: groupByColumns.map((column) => `my_sub_table.${column} = my_sub_count_table.${column}`).join(' AND '),
                model_type: mlModelType
            }).then((data) => {
                setDistributionData(data);
            });
        }
    }, [inView, allSqlFilters, groupByColumns.join()]);

    return (
        <div ref={ref} className='d-flex justify-content-center'>
            {distributionData.length > 100 ? (
                <Alert variant='secondary'>
                    {distributionData.length} classes
                </Alert>
            ) : (
                <ResponsiveContainer height={150} width='100%'>
                    <BarChart data={distributionData.map((d) => ({...d, value: d.value}))}>
                        <Tooltip/>
                        <Bar background={false} dataKey='value' minPointSize={2}>
                            {distributionData.map((d, i) => (
                                <Cell accentHeight='0px' fill={getHexColor(d.name, 0.65)} key={i} />
                            ))}
                        </Bar>
                        <XAxis dataKey='name' tick={false}/>
                    </BarChart>
                </ResponsiveContainer>
            )
            }
        </div>
    );
};

_DistributionCell.propTypes = {
    row: PropTypes.object,
    segmentationStore: PropTypes.object
};

const DistributionCell = setupComponent(_DistributionCell);

const _metricCell = ({cell}) => {
    const cellValues = cell.row.original;
    const cellId = cell.column.id;
    const cellFields = Object.keys(cellValues).filter((f) => f !== 'value');
    const {mlModelType} = useModel();
    const allSqlFilters = useAllSqlFilters();
    const allFilters = useAllFilters();
    const {ref, inView} = useInView();

    return (
        <>
            <div ref={ref}/>
            <Async
                refetchOnChanged={[allSqlFilters, inView]}
                fetchData={() => {

                    if (inView) {

                        return metricsClient(cellId, {
                            filters: [...allFilters, ...cellFields.map((f) => ({left: f, op: '=', right: cellValues[f]}))],
                            model_type: mlModelType,
                            iou_threshold: 0.5
                        });
                    } else {

                        return Promise.resolve([]);
                    }
                }}

                renderData={([data]) => (
                    !isNaN(data?.value) ? data?.value.toFixed(2) : '-'
                )}
            />
        </>
    );
};

_metricCell.propTypes = {
    cell: PropTypes.object.isRequired
};

const metricCell = setupComponent(_metricCell);

const Segmentation = ({segmentationStore}) => {
    const allFilters = useAllFilters();
    const [addColModal, setAddColModal] = useModal(false);
    const groupByColumns = segmentationStore.segmentation;
    const {mlModelType} = useModel();
    const handleApply = (cols) => {
        segmentationStore.segmentation = cols;
        setAddColModal(false);
    };

    return (
        <div className='my-3'>
            <div className='border rounded p-3'>
                <div className='d-flex mb-3'>
                    <p className='text-dark fw-bold fs-4 flex-grow-1'>
            Fairness &amp; Bias Analysis
                    </p>
                    <Button
                        className='border border-dark text-dark fw-bold px-4'
                        onClick={() => setAddColModal(true)}
                        variant='white'
                    >
                        <FontIcon
                            className='text-dark mx-2'
                            icon={IconNames.PLUS_MINUS}
                            size={15}
                        />
            Columns
                    </Button>
                </div>
                <Async
                    renderData={(data) => (
                        <Table
                            columns={(mlModelType === 'DOCUMENT_PROCESSING' ?
                                [
                                    {
                                        id: 'map',
                                        Header: 'mAP',
                                        Cell: metricCell
                                    },
                                    {
                                        id: 'mar',
                                        Header: 'mAR',
                                        Cell: metricCell
                                    },
                                    {
                                        id: 'classes',
                                        Header: 'Classes',
                                        Cell: DistributionCell
                                    },
                                    {
                                        accessor: 'value',
                                        Header: 'Sample Size'
                                    }
                                ] : mlModelType === 'SPEECH_TO_TEXT' ? [
                                    {
                                        id: 'exact-match',
                                        Header: 'EM',
                                        Cell: metricCell
                                    },
                                    {
                                        id: 'word-error-rate',
                                        Header: 'WER',
                                        Cell: metricCell
                                    },
                                    {
                                        accessor: 'value',
                                        Header: 'Sample Size'
                                    }
                                ] : mlModelType === 'Q_N_A' ? [
                                    {
                                        id: 'exact-match',
                                        Header: 'EM',
                                        Cell: metricCell
                                    },
                                    {
                                        id: 'f1-score-metric',
                                        Header: 'F1 Score',
                                        Cell: metricCell
                                    },
                                    {
                                        id: 'semantic-similarity',
                                        Header: 'semantic similarity',
                                        Cell: metricCell
                                    },
                                    {
                                        accessor: 'value',
                                        Header: 'Sample Size'
                                    }
                                ] : mlModelType === 'TEXT_CLASSIFIER' ? [
                                    {
                                        id: 'accuracy-metric',
                                        Header: 'Accuracy',
                                        Cell: metricCell
                                    },
                                    {
                                        id: 'f1-score-metric',
                                        Header: 'F1 Score',
                                        Cell: metricCell
                                    },
                                    {
                                        id: 'precision-metric',
                                        Header: 'Precision',
                                        Cell: metricCell
                                    },
                                    {
                                        id: 'recall-metric',
                                        Header: 'Recall',
                                        Cell: metricCell
                                    },
                                    {
                                        accessor: 'value',
                                        Header: 'Sample Size'
                                    }
                                ] : mlModelType === 'UNSUPERVISED_IMAGE_CLASSIFIER' || mlModelType === 'UNSUPERVISED_TEXT_CLASSIFIER' || mlModelType === 'UNSUPERVISED_OBJECT_DETECTION' ? [{
                                    id: 'confidence',
                                    Header: 'Confidence',
                                    Cell: metricCell
                                },
                                {
                                    id: 'entropy',
                                    Header: 'Entropy',
                                    Cell: metricCell
                                },
                                {
                                    id: 'prediction',
                                    Header: 'Online Predictions',
                                    Cell: DistributionCell
                                },
                                {
                                    accessor: 'value',
                                    Header: 'Sample Size'
                                }] : mlModelType === 'AUTO_COMPLETION' ? [{
                                    id: 'exact-match',
                                    Header: 'Token Exact Match',
                                    Cell: metricCell
                                }, {
                                    id: 'f1-score-metric',
                                    Header: 'Token F1 Score',
                                    Cell: metricCell
                                }, {
                                    accessor: 'value',
                                    Header: 'Sample Size'
                                }] : mlModelType === 'SEMANTIC_SIMILARITY' ? [{
                                    id: 'pearson-cosine',
                                    Header: 'Cosine Pearson Correlation',
                                    Cell: metricCell
                                }, {
                                    id: 'spearman-cosine',
                                    Header: 'Cosine Spearman Correlation',
                                    Cell: metricCell
                                }] : mlModelType === 'LEARNING_TO_RANK' ? [{
                                    id: 'mrr',
                                    Header: 'MRR',
                                    Cell: metricCell
                                }, {
                                    id: 'mean-ndcg',
                                    Header: 'Mean NDCG',
                                    Cell: metricCell
                                }, {
                                    accessor: 'value',
                                    Header: 'Sample Size',
                                    sortType: 'basic'
                                }] : [
                                    {
                                        id: 'accuracy-metric',
                                        Header: 'Accuracy',
                                        Cell: metricCell,
                                        width: 200
                                    },
                                    {
                                        accessor: 'value',
                                        Header: 'Sample Size'
                                    },
                                    {
                                        id: 'prediction',
                                        Header: 'Online Predictions',
                                        Cell: DistributionCell
                                    }
                                ]
                            ).concat(
                                groupByColumns.map((column) => ({
                                    accessor: (c) => {
                                        const value = c[column];

                                        return value === undefined || value === null ? '<none>' : value;
                                    },
                                    Header: column
                                }))
                            )}
                            data={data}
                        />
                    )}
                    refetchOnChanged={[groupByColumns.join(','), JSON.stringify(allFilters)]}
                    fetchData={() => groupByColumns.length ? metricsClient('queries/fairness-bias-columns', {
                        group_by: groupByColumns,
                        filters: allFilters
                    }) : Promise.resolve([])}
                />
                {addColModal && (
                    <Modal isOpen onClose={() => setAddColModal(false)} title='Choose Segmentation Columns'>
                        <AsyncSegmentationFields renderData={(fields) => (
                            <AddColumnModal
                                allColumns={fields}
                                onApply={handleApply}
                                initiallyselected={groupByColumns}
                            />
                        )}/>
                    </Modal>
                )}
            </div>
        </div>
    );
};

Segmentation.propTypes = {
    segmentationStore: PropTypes.object.isRequired,
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(Segmentation);
