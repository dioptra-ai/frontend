import PropTypes from 'prop-types';
import {useTable} from 'react-table';

const Table = ({columns, data, getRowProps}) => {
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
        <table {...getTableProps()} className='table fs-6'>
            <thead className='text-secondary border-top border-bottom'>
                <tr>
                    {headers.map((column, i) => (
                        <th className='text-center py-3 border-0' key={i} {...column.getHeaderProps()}
                            style={{width: `${100 / headers.length}%`, textOverflow: 'ellipsis', overflow: 'hidden'}}
                            title={column.render('Header')}
                        >
                            {column.render('Header')}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody {...getTableBodyProps()} className='text-dark'>
                {rows.map((row, i) => {
                    prepareRow(row);

                    return (
                        <tr key={i} {...row.getRowProps()} {...getRowProps?.(row)}>
                            {row.cells.map((cell, i) => {
                                return (
                                    <td className='text-center align-middle py-3' key={i} style={{textOverflow: 'ellipsis', overflow: 'hidden'}} {...cell.getCellProps()}
                                        title={cell.value}
                                    >
                                        {cell.render('Cell')}
                                    </td>
                                );
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
    getRowProps: PropTypes.func
};

export default Table;
