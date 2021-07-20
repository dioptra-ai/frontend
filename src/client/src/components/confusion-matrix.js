import React, {useEffect, useState} from 'react';
import {setupComponent} from '../helpers/component-helper';
import PropTypes from 'prop-types';
import timeseriesClient from 'clients/timeseries';
import {getName} from '../helpers/name-helper';
import {useTable} from 'react-table';
import theme from '../styles/theme.module.scss';

const Table = ({columns, data, onCellClick}) => {
    const {
        headers,
        rows,
        prepareRow
    } = useTable(
        {
            columns,
            data
        }
    );

    const getCellBackground = (value) => {
        if (typeof value === 'number') {
            return `rgba(31, 169, 200, ${value.toFixed(1)})`;
        } else if (!value) {
            return theme.mercury;
        } else {
            return 'transparent';
        }
    };

    return (
        <table className='table' style={{fontSize: '14px'}}>
            <thead className='text-dark fw-bold'>
                <tr>
                    {headers.map((column, i) => (
                        <th className='align-middle py-3 border-0' key={i} >{column.render('Header')}</th>
                    ))}
                </tr>
            </thead>
            <tbody className='text-dark fw-bold'>
                {rows.map((row, i) => {
                    prepareRow(row);

                    return (
                        <tr className='border-white border-3' key={i}>
                            {row.cells.map((cell, i) => {
                                return (
                                    <td
                                        className={`align-middle py-3 border-white border-3 text-${i === 0 ? 'left' : 'center'}`}
                                        key={i}
                                        onClick={() => cell.value && onCellClick(cell.column.id, cell.row.values.groundtruth)} {...cell.getCellProps()}
                                        style={{backgroundColor: getCellBackground(cell.value), cursor: cell.value ? 'pointer' : 'auto'}}
                                    >
                                        {cell.render('Cell')}
                                    </td>);
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

Table.propTypes = {
    columns: PropTypes.array,
    data: PropTypes.array,
    onCellClick: PropTypes.func
};

const ConfusionMatrix = ({errorStore, timeStore}) => {
    const [groundtruthClasses, setGroundtruthClasses] = useState([]);
    const [predictionClasses, setPredictionClasses] = useState([]);
    const [matrixData, setMatrixData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([{
        Header: '',
        accessor: 'groundtruth'
    }]);
    const [seletedCell, setSelectedCell] = useState({
        prediction: '',
        groundtruth: ''
    });


    const getClasses = (data, key) => {
        const classes = [];

        data.forEach((obj) => {
            if (classes.indexOf(obj[key]) === -1) {
                classes.push(obj[key]);
            }
        });

        return classes;
    };

    useEffect(() => {
        timeseriesClient({
            query: `
                SELECT
                predictionTable.groundtruth,
                predictionTable.prediction,
                cast(predictionTable.c as FLOAT) / cast(groundTable.c as FLOAT) as distribution
                FROM (
                SELECT groundtruth, prediction, COUNT(*) AS c
                FROM "dioptra-gt-combined-eventstream"
                WHERE ${timeStore.sQLTimeFilter}
                GROUP BY groundtruth, prediction
                )  as predictionTable
                LEFT JOIN (
                SELECT groundtruth, COUNT(*) AS c
                FROM "dioptra-gt-combined-eventstream"
                WHERE ${timeStore.sQLTimeFilter}
                GROUP BY groundtruth
                ) AS groundTable
                ON groundTable.groundtruth = predictionTable.groundtruth
            `
        }).then((res) => {
            setGroundtruthClasses(getClasses(res, 'groundtruth'));
            setPredictionClasses(getClasses(res, 'prediction'));
            setMatrixData(res);

        }).catch((e) => errorStore.reportError(e));
    }, [timeStore.sQLTimeFilter]);

    useEffect(() => {
        const classes = predictionClasses.map((c) => ({
            Header: getName(c),
            accessor: c
        }));

        setColumns([{
            Header: '',
            accessor: 'groundtruth'
        }, ...classes]);

    }, [predictionClasses]);

    useEffect(() => {
        const rows = groundtruthClasses.map((c) => {
            const filtered = matrixData.filter((d) => d.groundtruth === c);

            const cells = {groundtruth: c};

            filtered.forEach((e) => {
                cells[e.prediction] = e.distribution;
            });

            return cells;

        });

        setTableData(rows);

    }, [matrixData]);

    useEffect(() => {
        timeseriesClient({
            query: `
                SELECT image_url FROM "dioptra-gt-combined-eventstream"
                WHERE groundtruth = '${seletedCell.groundtruth}' AND prediction = '${seletedCell.prediction}'
                AND ${timeStore.sQLTimeFilter}
                LIMIT 20
            `
        }).then((res) => {
            console.log(res);
        }).catch((e) => errorStore.reportError(e));
    }, [seletedCell]);

    return (

        <div className='my-5'>
            <h3 className='text-dark fw-bold fs-3 mb-3'>Confusion matrix</h3>
            {predictionClasses.length !== 0 && <Table
                columns={columns}
                data={tableData}
                onCellClick={(prediction, groundtruth) => {
                    setSelectedCell({prediction, groundtruth});
                }}
            />}
        </div>
    );
};

ConfusionMatrix.propTypes = {
    errorStore: PropTypes.object,
    timeStore: PropTypes.object
};

export default setupComponent(ConfusionMatrix);
