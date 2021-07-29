import React, {useState} from 'react';
import {useTable} from 'react-table';
import theme from '../styles/theme.module.scss';
import PropTypes from 'prop-types';

const MatrixTable = ({columns, data, onCellClick}) => {
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
            return `rgba(31, 169, 200, ${(0.1 + value).toFixed(1)})`;
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
        <table className='table fs-6' style={{marginBottom: '50px', position: 'relative'}} >
            <thead className='text-dark bold-text'>
                <tr className='w-100'>
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
            <tbody className='text-dark bold-text'>
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
                                        style={{backgroundColor: getCellBackground(cell.value), cursor: (i && cell.value) ? 'pointer' : 'auto', position: 'relative', width: `${100 / columns.length}%`}}
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
    );
};

MatrixTable.propTypes = {
    columns: PropTypes.array,
    data: PropTypes.array,
    onCellClick: PropTypes.func
};

export default MatrixTable;
