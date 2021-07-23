import React, {useEffect, useState} from 'react';
import {setupComponent} from '../helpers/component-helper';
import PropTypes from 'prop-types';
import timeseriesClient from 'clients/timeseries';
import {getName} from '../helpers/name-helper';
import {useTable} from 'react-table';
import theme from '../styles/theme.module.scss';
import BtnIcon from './btn-icon';
import {IconNames} from '../constants';
import CustomCarousel from './carousel';
import Modal from './modal';
import useModal from './../customHooks/useModal';

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
    const [selectedCellKey, setSelectedCellKey] = useState('');

    const getCellBackground = (value) => {
        if (typeof value === 'number') {
            return `rgba(31, 169, 200, ${value.toFixed(1)})`;
        } else if (!value) {
            return theme.mercury;
        } else {
            return 'transparent';
        }
    };

    const handleCellClick = (cell) => {
        onCellClick(cell.column.id, cell.row.values.groundtruth);
        setSelectedCellKey(cell.getCellProps().key);
    };

    return (
        <>
            <div className='position-relative' style={{marginRight: '30px'}}>
                <table className='table' style={{fontSize: '14px'}} >
                    <thead className='text-dark fw-bold'>
                        <tr>
                            {headers.map((column, i) => (
                                <th
                                    className='align-middle py-3 border-0'
                                    key={i}
                                    style={{width: `${100 / columns.length}%`}}
                                >
                                    {column.render('Header')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className='text-dark fw-bold'>
                        {rows.map((row, i) => {
                            prepareRow(row);

                            return (
                                <tr className='border-2 border-white' key={i}>
                                    {row.cells.map((cell, i) => {
                                        return (
                                            <td
                                                className={`border-white border-2 px-2 py-3 text-${i ? 'center' : 'left'} align-middle`}
                                                key={i}
                                                onClick={() => i && cell.value && handleCellClick(cell)}
                                                {...cell.getCellProps()}
                                                style={{backgroundColor: getCellBackground(cell.value), cursor: (i && cell.value) ? 'pointer' : 'auto', position: 'relative'}}
                                            >
                                                {cell.render('Cell')}
                                                <div className={`border border-2 border-${cell.getCellProps().key === selectedCellKey ? 'dark' : 'white'}`} style={{position: 'absolute', inset: 0}}></div>
                                            </td>);
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <p
                    className='position-absolute text-secondary m-0 text-center'
                    style={{transform: 'rotate(-90deg)', top: '50%', right: '-70px'}}
                >
                   Ground Truth
                </p>
            </div>
            <p className='text-secondary m-0 text-center'>Prediction</p>
        </>
    );
};

Table.propTypes = {
    columns: PropTypes.array,
    data: PropTypes.array,
    onCellClick: PropTypes.func
};

const Examples = ({onClose, images}) => {
    const [exampleInModal, setExampleInModal] = useModal(false);

    return (
        <div className='bg-white-blue my-3 p-3'>
            <div className='d-flex align-items-center'>
                <p className='text-dark m-0 fw-bold flex-grow-1'>Examples</p>
                <BtnIcon
                    className='text-dark border-0'
                    icon={IconNames.CLOSE}
                    onClick={onClose}
                    size={15}
                />
            </div>
            <CustomCarousel items={images} onItemClick={(example) => setExampleInModal(example)}/>
            {exampleInModal && <Modal>
                <div className='d-flex align-items-center my-3'>
                    <p className='text-white m-0 flex-grow-1'>Example</p>
                    <BtnIcon
                        className='text-white mx-2 border-0'
                        icon={IconNames.CLOSE}
                        onClick={() => setExampleInModal(null)}
                        size={15}
                    />
                </div>
                <img alt='Example' className='rounded' src={exampleInModal} width='100%'/>
            </Modal>}
        </div>

    );
};

Examples.propTypes = {
    images: PropTypes.array,
    onClose: PropTypes.func
};

const ConfusionMatrix = ({errorStore, timeStore}) => {
    const [groundtruthClasses, setGroundtruthClasses] = useState([]);
    const [predictionClasses, setPredictionClasses] = useState([]);
    const [matrixData, setMatrixData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null);
    const [examples, setExamples] = useState(null);

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
            accessor: c,
            Cell: ({value}) => !value ? 0 : `${(value * 100).toFixed(2)} %`
        }));

        setColumns([{
            Header: '',
            accessor: 'groundtruth',
            Cell: ({value}) => getName(value)
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
        if (selectedCell) {
            timeseriesClient({
                query: `
                SELECT image_url FROM "dioptra-gt-combined-eventstream"
                WHERE groundtruth = '${selectedCell.groundtruth}' AND prediction = '${selectedCell.prediction}'
                AND ${timeStore.sQLTimeFilter}
                LIMIT 20
            `
            }).then((res) => {
                console.log(res);
                setExamples(res);
            }).catch((e) => {
                errorStore.reportError(e);
                setExamples([
                    'https://via.placeholder.com/150',
                    'https://via.placeholder.com/150',
                    'https://via.placeholder.com/150',
                    'https://via.placeholder.com/150',
                    'https://via.placeholder.com/150',
                    'https://via.placeholder.com/150',
                    'https://via.placeholder.com/150',
                    'https://via.placeholder.com/150',
                    'https://via.placeholder.com/150'
                ]);
            });
        }
    }, [selectedCell]);

    return (

        <div className='my-5'>
            <h3 className='text-dark fw-bold fs-3 mb-3'>Confusion matrix</h3>
            <div className='border rounded p-3'>
                {predictionClasses.length !== 0 && <Table
                    columns={columns}
                    data={tableData}
                    onCellClick={(prediction, groundtruth) => setSelectedCell({prediction, groundtruth})
                    }
                />}
                {examples && <Examples images={examples} onClose={() => setExamples(null)}/>}
            </div>
        </div>
    );
};

ConfusionMatrix.propTypes = {
    errorStore: PropTypes.object,
    timeStore: PropTypes.object
};

export default setupComponent(ConfusionMatrix);
