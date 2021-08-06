/* eslint-disable max-lines */
import {Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer, XAxis} from 'recharts';

import timeseriesClient from 'clients/timeseries';
import {useInView} from 'react-intersection-observer';
import {setupComponent} from 'helpers/component-helper';
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import FontIcon from './font-icon';
import {IconNames} from '../constants';
import Table from './table';
import Modal from './modal';
import useModal from '../customHooks/useModal';
import {getHexColor} from 'helpers/color-helper';
import theme from '../styles/theme.module.scss';
import TimeseriesQuery, {sql} from 'components/timeseries-query';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';

const AddColumnModal = ({onCancel, onApply, allColumns, selected}) => {
    const featureColumns = allColumns.filter((c) => c.startsWith('feature.'));
    const tagColumns = allColumns.filter((c) => c.startsWith('tag.'));
    const [selectedColumns, setSelectedColumns] = useState(selected);

    const handleChange = (e, col) => {
        if (e.target.checked) {
            setSelectedColumns([...selectedColumns, col]);

        } else {
            const updatedCols = selectedColumns.filter((c) => c !== col);

            setSelectedColumns(updatedCols);
        }
    };

    return (
        <Modal className='bg-white rounded p-4'>
            <p className='text-dark fw-bold fs-4 pb-3 mb-4 border-bottom border-mercury'>
                Add or remove columns from the table
            </p>
            <div className='d-flex flex-column mb-4'>
                <p className='text-dark fw-bold fs-6'>FEATURES</p>
                {featureColumns.map((feature, i) => (
                    <label className='checkbox my-2 fs-6' key={i}>
                        <input
                            defaultChecked={selectedColumns.includes(feature)}
                            onChange={(e) => handleChange(e, feature)}
                            type='checkbox'/>
                        <span className='fs-6'>{feature}</span>
                    </label>
                ))}
            </div>
            <div className='d-flex flex-column mb-4'>
                <p className='text-dark fw-bold fs-6'>TAGS</p>
                {tagColumns.map((tag, i) => (
                    <label className='checkbox my-2 fs-6' key={i}>
                        <input
                            defaultChecked={selectedColumns.includes(tag)}
                            onChange={(e) => handleChange(e, tag)}
                            type='checkbox'/>
                        <span className='fs-6'>{tag}</span>
                    </label>
                ))}
            </div>
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
    selected: PropTypes.array
};

const Text = ({value}) => {

    return (
        <span>
            {value}
        </span>
    );
};

Text.propTypes = {
    value: PropTypes.string
};

const _AccuracyCell = ({groupByColumns, timeStore, row}) => {
    const {ref, inView} = useInView();
    const [accuracyData, setAccuracyData] = useState([]);
    const allSqlFilters = useAllSqlFilters();

    useEffect(() => {
        if (inView) {
            timeseriesClient({
                query: `WITH my_sample_table as (
                    SELECT *
                    FROM "dioptra-gt-combined-eventstream"
                    WHERE ${allSqlFilters}
                        AND ${groupByColumns.map((c) => `"${c}"='${row.original[c]}'`).join(' AND ')}
                    )
                    SELECT 
                      FLOOR(__time TO MINUTE) AS x,
                      100 * cast(sum(CASE WHEN groundtruth=prediction THEN 1 ELSE 0 end) AS float) / count(*) AS y
                    FROM my_sample_table
                    GROUP BY FLOOR(__time TO MINUTE), ${groupByColumns.map((c) => `"${c}"`).join(', ')}`
            }).then((data) => {
                setAccuracyData(data);
            });
        }
    }, [inView, timeStore.sqlTimeFilter]);

    return (
        <div ref={ref} style={{height: '150px'}}>
            <ResponsiveContainer height='100%' width='100%'>
                <AreaChart data={accuracyData.map(({x, y}) => ({
                    y,
                    x: new Date(x).getTime()
                }))}>
                    <defs>
                        <linearGradient id='color' x1='0' x2='0' y1='0' y2='1'>
                            <stop offset='10%' stopColor={theme.primary} stopOpacity={0.7}/>
                            <stop offset='90%' stopColor='#FFFFFF' stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id='warning' x1='0' x2='0' y1='0' y2='1'>
                            <stop offset='10%' stopColor={theme.warning} stopOpacity={0.9}/>
                            <stop offset='90%' stopColor='#FFFFFF' stopOpacity={0.1}/>
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
    groupByColumns: PropTypes.array,
    row: PropTypes.object,
    timeStore: PropTypes.object.isRequired
};

const AccuracyCell = setupComponent(_AccuracyCell);


const _DistributionCell = ({groupByColumns, timeStore, row}) => {
    const {ref, inView} = useInView();
    const allSqlFilters = useAllSqlFilters();
    const [distributionData, setDistributionData] = useState([]);
    const sqlColumns = groupByColumns.map((c) => `"${c}"`).join(', ');

    useEffect(() => {
        if (inView) {
            timeseriesClient({
                query: `WITH distribution_sample_table as (
                  SELECT *
                  FROM "dioptra-gt-combined-eventstream"
                  WHERE ${allSqlFilters}
                        AND ${groupByColumns.map((c) => `"${c}"='${row.original[c]}'`).join(' AND ')}
                )
                SELECT
                  cast(my_sub_table.my_count as float) / my_sub_count_table.total_count as dist,
                  my_sub_table.prediction as "value"
                  FROM (
                    SELECT
                      count(1) AS my_count,
                      prediction,
                      ${sqlColumns}
                    FROM distribution_sample_table
                    GROUP BY prediction, ${sqlColumns}
                  ) AS my_sub_table
                  JOIN (
                    SELECT
                      count(*) as total_count,
                      ${sqlColumns}
                    FROM distribution_sample_table
                    GROUP BY ${sqlColumns}
                  ) AS my_sub_count_table
                  ON ${groupByColumns.map((column) => `my_sub_table."${column}" = my_sub_count_table."${column}"`).join(', ')}`
            }).then((data) => {
                setDistributionData(data);
            });
        }
    }, [inView, timeStore.sqlTimeFilter]);

    return (
        <div ref={ref}>
            <BarChart data={distributionData} height={70} width={150}>
                <Bar background={false} dataKey='dist' minPointSize={2}>
                    {distributionData.map((d, i) => (
                        <Cell accentHeight='0px' fill={getHexColor(d.value, 0.65)} key={i}/>
                    ))}
                </Bar>
            </BarChart>
        </div>
    );
};

_DistributionCell.propTypes = {
    groupByColumns: PropTypes.array,
    row: PropTypes.object,
    timeStore: PropTypes.object.isRequired
};

const DistributionCell = setupComponent(_DistributionCell);

const Segmentation = ({timeStore}) => {
    const [groupByColumns, setGroupByColumns] = useState(['tag.gender']);
    const [addColModal, setAddColModal] = useModal(false);

    return (
        <div className='my-5'>
            <h3 className='text-dark fw-bold fs-3 mb-3'>Segmentation</h3>
            <div className='border rounded p-3' >
                <div className='d-flex mb-3'>
                    <p className='text-dark fw-bold fs-5 flex-grow-1'>Fairness &amp; Bias Analysis</p>
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
                <TimeseriesQuery
                    defaultData={[]}
                    renderData={(data) => (
                        <Table
                            columns={
                                [
                                    {
                                        id: 'accuracy',
                                        Header: 'Accuracy Trend',
                                        Cell: (props) => ( // eslint-disable-line react/display-name
                                            <AccuracyCell groupByColumns={groupByColumns} {...props}/>
                                        )
                                    },
                                    {
                                        accessor: 'sampleSize',
                                        Header: 'Sample Size',
                                        Cell: (props) => ( // eslint-disable-line react/display-name
                                            <Text {...props}/>
                                        )
                                    },
                                    {
                                        id: 'predictioj',
                                        Header: 'Online Predictions',
                                        Cell: (props) => ( // eslint-disable-line react/display-name
                                            <DistributionCell groupByColumns={groupByColumns} {...props}/>
                                        )
                                    }
                                ].concat(groupByColumns.map((column) => ({
                                    accessor: (c) => c[column],
                                    Header: column,
                                    Cell: (props) => ( // eslint-disable-line react/display-name
                                        <Text {...props}/>
                                    )
                                })))
                            }
                            data={data}
                        />
                    )}
                    sql={sql`
                        SELECT
                          ${groupByColumns.map((c) => `"${c}"`).join(', ')},
                          count(1) as sampleSize
                        FROM "dioptra-gt-combined-eventstream"
                        WHERE ${timeStore.sqlTimeFilter}
                        GROUP BY ${groupByColumns.map((c) => `"${c}"`).join(', ')}
                        ORDER BY sampleSize DESC
                        `}
                />
                <TimeseriesQuery
                    defaultData={[]}
                    renderData={(data) => addColModal &&
                        <AddColumnModal
                            allColumns={data.map((d) => d.column)}
                            onApply={(cols) => {
                                setGroupByColumns(cols);
                                setAddColModal(false);
                            }}
                            onCancel={() => setAddColModal(false)}
                            selected={groupByColumns}
                        />
                    }
                    sql={sql`
                        SELECT COLUMN_NAME as "column"
                        FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_NAME = 'dioptra-gt-combined-eventstream'
                        AND (COLUMN_NAME LIKE 'tag.%' OR COLUMN_NAME LIKE 'feature.%')
                    `}
                />
            </div>
        </div>
    );
};

Segmentation.propTypes = {
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(Segmentation);
