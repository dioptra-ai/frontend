import PropTypes from 'prop-types';
import {useTable} from 'react-table';

const Table = ({columns, data}) => {
    const {
        getTableProps,
        getTableBodyProps,
        headers,
        rows,
        prepareRow
    } = useTable(
        {
            columns,
            data
        }
    );

    return (
        <table {...getTableProps()} className='table' style={{fontSize: '14px'}}>
            <thead className='text-secondary border-bottom'>
                <tr>
                    {headers.map((column, i) => (
                        <th className='align-middle py-3 border-0' key={i} {...column.getHeaderProps()} style={{maxWidth: '200px'}}>
                            {column.render('Header')}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody {...getTableBodyProps()} className='text-dark'>
                {rows.map((row, i) => {
                    prepareRow(row);

                    return (
                        <tr key={i} {...row.getRowProps()}>
                            {row.cells.map((cell, i) => {
                                return <td className='align-middle py-3' key={i} style={{maxWidth: '200px'}} {...cell.getCellProps()}>{cell.render('Cell')}</td>;
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
    data: PropTypes.array
};

export default Table;
