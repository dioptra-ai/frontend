/* eslint-disable max-lines */
import {useInView} from 'react-intersection-observer';
import PropTypes from 'prop-types';
import React, {useContext, useEffect, useState} from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis
} from 'recharts';

import useModel from 'hooks/use-model';
import {setupComponent} from 'helpers/component-helper';
import Button from 'react-bootstrap/Button';
import FontIcon from 'components/font-icon';
import {IconNames} from 'constants';
import Table from 'components/table';
import Modal from 'components/modal';
import useModal from 'hooks/useModal';
import {getHexColor} from 'helpers/color-helper';
import theme from 'styles/theme.module.scss';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import {SmallChart} from 'components/area-graph';
import {Tooltip as BarTooltip} from 'components/bar-graph';
import appContext from 'context/app-context';

const AddColumnModal = ({onCancel, onApply, allColumns, initiallyselected}) => {
    const featureColumns = allColumns.filter((c) => c.startsWith('features.'));
    const tagColumns = allColumns.filter((c) => c.startsWith('tags.'));
    const audioMetadataColumns = allColumns.filter((c) => c.startsWith('audio_metadata.'));
    const allColumnsSet = new Set(allColumns);
    const [selectedColumns, setSelectedColumns] = useState(initiallyselected.filter((s) => allColumnsSet.has(s)));

    const handleChange = (e, col) => {
        if (e.target.checked) {
            setSelectedColumns([...selectedColumns, col]);
        } else {
            const updatedCols = selectedColumns.filter((c) => c !== col);

            setSelectedColumns(updatedCols);
        }
    };

    return (
        <Modal isOpen onClose={onCancel} title='Add or remove columns from the table'>
            {featureColumns.length > 0 && (
                <div className='d-flex flex-column mb-4'>
                    <p className='text-dark fw-bold fs-6'>FEATURES</p>
                    {featureColumns.map((feature, i) => (
                        <label className='checkbox my-2 fs-6' key={i}>
                            <input
                                defaultChecked={selectedColumns.includes(feature)}
                                onChange={(e) => handleChange(e, feature)}
                                type='checkbox'
                            />
                            <span className='fs-6'>{feature}</span>
                        </label>
                    ))}
                </div>
            )}
            {tagColumns.length > 0 && (
                <div className='d-flex flex-column mb-4'>
                    <p className='text-dark fw-bold fs-6'>TAGS</p>
                    {tagColumns.map((tag, i) => (
                        <label className='checkbox my-2 fs-6' key={i}>
                            <input
                                defaultChecked={selectedColumns.includes(tag)}
                                onChange={(e) => handleChange(e, tag)}
                                type='checkbox'
                            />
                            <span className='fs-6'>{tag}</span>
                        </label>
                    ))}
                </div>
            )}
            {audioMetadataColumns.length > 0 && (
                <div className='d-flex flex-column mb-4'>
                    <p className='text-dark fw-bold fs-6'>AUDIO METADATA</p>
                    {audioMetadataColumns.map((tag, i) => (
                        <label className='checkbox my-2 fs-6' key={i}>
                            <input
                                defaultChecked={selectedColumns.includes(tag)}
                                onChange={(e) => handleChange(e, tag)}
                                type='checkbox'
                            />
                            <span className='fs-6'>{tag}</span>
                        </label>
                    ))}
                </div>
            )}
            {!tagColumns.length && !featureColumns.length && !audioMetadataColumns.length ? (
                <p className='text-secondary fs-6 mb-4 text-center'>No Columns Available</p>
            ) : null}
            <div className='border-top border-mercury py-3'>
                <Button
                    className='text-white fw-bold fs-6 px-5 py-2'
                    onClick={() => onApply(selectedColumns)}
                    variant='primary'
                >
          APPLY
                </Button>
                <Button
                    className='text-secondary fw-bold fs-6 px-5 py-2 mx-3'
                    onClick={onCancel}
                    variant='light-blue'
                >
          CANCEL
                </Button>
            </div>
        </Modal>
    );
};

AddColumnModal.propTypes = {
    allColumns: PropTypes.array,
    onApply: PropTypes.func,
    onCancel: PropTypes.func,
    initiallyselected: PropTypes.array
};

const _AccuracyCell = ({timeStore, segmentationStore, row}) => {
    const groupByColumns = segmentationStore.segmentation;
    const {ref, inView} = useInView();
    const [accuracyData, setAccuracyData] = useState([]);
    const allSqlFilters = useAllSqlFilters();
    const maxTimeseriesTicks = 20;
    const timeGranularity = timeStore
        .getTimeGranularity(maxTimeseriesTicks)
        .toISOString();

    useEffect(() => {
        if (inView) {
            metricsClient('queries/accuracy-data', {
                sql_filters: allSqlFilters,
                time_granularity: timeGranularity,
                columns: groupByColumns.map((c) => `"${c}"`).join(', '),
                original_columns: groupByColumns.map((c) => `"${c}"='${row.original[c]}'`).join(' AND ')
            }).then((data) => {
                setAccuracyData(data);
            });
        }
    }, [inView, allSqlFilters, groupByColumns.join()]);

    return (
        <div ref={ref} style={{height: '150px', width: '300px'}}>
            <ResponsiveContainer height='100%' width='100%'>
                <AreaChart
                    data={accuracyData.map(({x, y}) => ({
                        y,
                        x: new Date(x).getTime()
                    }))}
                >
                    <defs>
                        <linearGradient id='color' x1='0' x2='0' y1='0' y2='1'>
                            <stop offset='10%' stopColor={theme.primary} stopOpacity={0.7} />
                            <stop offset='90%' stopColor='#FFFFFF' stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id='warning' x1='0' x2='0' y1='0' y2='1'>
                            <stop offset='10%' stopColor={theme.warning} stopOpacity={0.9} />
                            <stop offset='90%' stopColor='#FFFFFF' stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        axisLine={false}
                        dataKey='x'
                        domain={timeStore.rangeMillisec}
                        scale='time'
                        tick={false}
                        type='number'
                    />
                    <Area
                        dataKey='y'
                        fill='url(#color)'
                        stroke={theme.primary}
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

_AccuracyCell.propTypes = {
    row: PropTypes.object,
    segmentationStore: PropTypes.object,
    timeStore: PropTypes.object.isRequired
};

const AccuracyCell = setupComponent(_AccuracyCell);

const _DistributionCell = ({row, segmentationStore}) => {
    const groupByColumns = segmentationStore.segmentation;
    const {ref, inView} = useInView();
    const {mlModelType} = useModel();
    const allSqlFilters = useAllSqlFilters();
    const [distributionData, setDistributionData] = useState([]);
    const sqlColumns = groupByColumns.map((c) => `"${c}"`).join(', ');

    useEffect(() => {
        if (inView) {
            metricsClient('queries/distribution-data', {
                sql_columns: sqlColumns,
                sql_filters: `${allSqlFilters} AND ${groupByColumns.map((c) => `"${c}"='${row.original[c]}'`).join(' AND ')}`,
                columns: groupByColumns.map((column) => `my_sub_table."${column}" = my_sub_count_table."${column}"`).join(' AND '),
                model_type: mlModelType
            }).then((data) => {
                setDistributionData(data);
            });
        }
    }, [inView, allSqlFilters, groupByColumns.join()]);

    return (
        <div ref={ref}>
            <BarChart data={distributionData.map((d) => ({...d, value: 100 * d.value}))} height={150} width={150}>
                <Tooltip content={<BarTooltip unit='%'/>}/>
                <Bar background={false} dataKey='value' minPointSize={2}>
                    {distributionData.map((d, i) => (
                        <Cell accentHeight='0px' fill={getHexColor(d.name, 0.65)} key={i} />
                    ))}
                </Bar>
                <XAxis dataKey='name' tick={false}/>
            </BarChart>
        </div>
    );
};

_DistributionCell.propTypes = {
    row: PropTypes.object,
    segmentationStore: PropTypes.object
};

const DistributionCell = setupComponent(_DistributionCell);

const _metricCell = ({cell, timeStore}) => {
    const cellValues = cell.row.original;
    const cellId = cell.column.id;
    const cellFields = Object.keys(cellValues).filter((f) => f !== 'value');
    const {mlModelType} = useModel();
    const allSqlFilters = useAllSqlFilters();
    const {isModelView} = useContext(appContext);
    const {ref, inView} = useInView();

    if (isModelView) {
        const timeGranularity = timeStore.getTimeGranularity(5).toISOString();

        return (
            <>
                <div ref={ref}/>
                <Async
                    refetchOnChanged={[allSqlFilters, timeGranularity, inView]}
                    fetchData={() => {

                        if (inView) {
                            return metricsClient(cellId, {
                                sql_filters: `${allSqlFilters} AND ${cellFields.map((f) => `"${f}"='${cellValues[f]}'`).join(' AND ')}`,
                                model_type: mlModelType,
                                iou_threshold: 0.5,
                                time_granularity: timeGranularity
                            });
                        } else {

                            return Promise.resolve([]);
                        }
                    }}
                    renderData={(data) => (
                        <div style={{height: '150px'}}>
                            <SmallChart
                                data={data}
                                xDataKey='time'
                                yDataKey='value'
                            />
                        </div>
                    )}
                />
            </>
        );
    } else {

        return (
            <>
                <div ref={ref}/>
                <Async
                    refetchOnChanged={[allSqlFilters, inView]}
                    fetchData={() => {

                        if (inView) {

                            return metricsClient(cellId, {
                                sql_filters: `${allSqlFilters} AND ${cellFields.map((f) => `"${f}"='${cellValues[f]}'`).join(' AND ')}`,
                                model_type: mlModelType,
                                iou_threshold: 0.5
                            });
                        } else {

                            return Promise.resolve([]);
                        }
                    }}

                    renderData={(data) => (
                        !isNaN(data[0]?.value) ? data[0]?.value.toFixed(2) : '-'
                    )}
                />
            </>
        );
    }
};

_metricCell.propTypes = {
    cell: PropTypes.object.isRequired,
    timeStore: PropTypes.object.isRequired
};

const metricCell = setupComponent(_metricCell);

const Segmentation = ({timeStore, segmentationStore}) => {
    const allSqlFilters = useAllSqlFilters();
    const [addColModal, setAddColModal] = useModal(false);
    const groupByColumns = segmentationStore.segmentation;
    const {mlModelType, mlModelId} = useModel();
    const {isModelView} = useContext(appContext);
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
                            columns={(mlModelType === 'DOCUMENT_PROCESSING' || mlModelType === 'UNSUPERVISED_OBJECT_DETECTION' ?
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
                                ] : mlModelType === 'AUTO_COMPLETION' ? [{
                                    id: 'f1-score-metric',
                                    Header: 'Token F1 Score',
                                    Cell: metricCell
                                }] : [
                                    {
                                        id: 'accuracy',
                                        Header: 'Accuracy Trend',
                                        Cell: AccuracyCell,
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
                                    accessor: (c) => c[column],
                                    Header: column
                                }))
                            )}
                            data={data}
                        />
                    )}
                    refetchOnChanged={[groupByColumns.join(','), allSqlFilters]}
                    fetchData={() => groupByColumns.length ? metricsClient('queries/fairness-bias-columns', {
                        group_by: groupByColumns,
                        sql_filters: allSqlFilters
                    }) : Promise.resolve([])}
                />
                {addColModal && (
                    <Async
                        renderData={(featuresAndTags) => featuresAndTags.length ? (
                            <Async
                                renderData={([data]) => (
                                    <AddColumnModal
                                        allColumns={featuresAndTags
                                            .filter((_, i) => data && data[i] > 0)
                                            .map((d) => d.column)}
                                        onApply={handleApply}
                                        onCancel={() => setAddColModal(false)}
                                        initiallyselected={groupByColumns}
                                    />
                                )}
                                resultFormat='array'
                                fetchData={() => metricsClient('queries/fairness-bias-columns-counts', {
                                    counts: featuresAndTags.map(({column}) => `COUNT("${column}")`).join(', '),
                                    sql_time_filter: isModelView ? timeStore.sqlTimeFilter : 'TRUE',
                                    ml_model_id: mlModelId
                                })}
                            />
                        ) : null
                        }
                        fetchData={mlModelType === 'TABULAR_CLASSIFIER' ?
                            () => metricsClient('queries/fairness-bias-columns-names-for-features') :
                            mlModelType === 'SPEECH_TO_TEXT' ?
                                () => metricsClient('queries/fairness-bias-columns-names-for-audio-metadata') :
                                () => metricsClient('queries/fairness-bias-columns-names-for-tags')
                        }
                    />
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
