import React, {useState} from 'react';
import {useTable} from 'react-table';
import theme from '../styles/theme.module.scss';
import PropTypes from 'prop-types';
import {TiArrowSortedDown, TiArrowSortedUp} from 'react-icons/ti';

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

    const getCellBackground = (cell, i) => {

        if (i !== 0) {
            const value = cell?.value?.value;

            return value ? `rgba(31, 169, 200, ${(0.1 + value).toFixed(1)})` : theme.mercury;
        } else return '';
    };

    const handleCellClick = (cell) => {
        onCellClick(cell.column.id, cell.row.values.groundtruth);
        setSelectedCellKey(cell.getCellProps().key);
    };

    return (
        <table className='matrix-table table fs-6' style={{marginBottom: '50px', position: 'relative'}} >

            <colgroup>
                {
                    columns.map((_, i) => (
                        <col key={i} span='1' style={{maxWidth: 200, width: `${100 / columns.length}%`}}/>
                    ))
                }
            </colgroup>
            <thead className='text-dark bold-text border-0'>
                <tr className='w-100'>
                    {headers.map((column, i) => (
                        <th
                            className='align-middle py-3 border-0'
                            key={i}
                            style={{
                                maxWidth: 200,
                                overflowWrap: 'break-word',
                                textAlign: 'center'
                            }}
                        >
                            {
                                i !== 0 && (<div className='d-flex flex-column justify-space-between align-items-center align-content-center gap-3 cursor-pointer'>
                                    {column.render('Header')}
                                    {true ? <TiArrowSortedUp/> : <TiArrowSortedDown/>}
                                </div>)

                            }
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className='text-dark bold-text border-0'>
                {rows.map((row, i) => {
                    prepareRow(row);

                    return (
                        <tr className='border-0' key={i}>
                            {row.cells.map((cell, i) => (
                                React.createElement(i === 0 ? 'th' : 'td', {
                                    className: `border-0 rounded-1 px-2 ${i ? 'pt-4 text-center' : 'text-left'} align-middle`,
                                    key: i,
                                    onClick: () => i && cell?.value?.value && handleCellClick(cell),
                                    ...cell.getCellProps(),
                                    style: {
                                        backgroundColor: getCellBackground(cell, i),
                                        cursor: (i && cell?.value?.value) ? 'pointer' : 'auto',
                                        position: 'relative',
                                        maxWidth: 200,
                                        overflowWrap: 'break-word'
                                    }
                                }, <>
                                    <div
                                        className={`border rounded-1 ${cell.getCellProps().key === selectedCellKey ? 'border-2 border-dark' : 'border-1 border-white'}`}
                                        style={{
                                            position: 'absolute',
                                            inset: 0
                                        }}
                                    />
                                    {
                                        cell.render('Cell')
                                    }
                                </>)
                            ))}
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
