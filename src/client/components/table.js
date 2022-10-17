import PropTypes from 'prop-types';
import {useSortBy, useTable} from 'react-table';
import {TiArrowSortedDown, TiArrowSortedUp, TiArrowUnsorted} from 'react-icons/ti';


const Table = ({columns, data, getRowProps}) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow
    } = useTable(
        {
            columns,
            data
        },
        useSortBy
    );

    return (
        <table {...getTableProps()} className='table fs-6'>
            <thead className='text-secondary border-top border-bottom'>
                {headerGroups.map((headerGroup, i) => (
                    <tr key={i} {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column, i) => (
                            // Add the sorting props to control sorting. For this example
                            // we can add them into the header props
                            <th className='text-center py-3 border-0' key={i}
                                {...column.getHeaderProps(column.getSortByToggleProps())}
                                style={{width: `${100 / headerGroup.headers.length}%`, textOverflow: 'ellipsis', overflow: 'hidden'}}
                                title={column.render('Header')}
                            >
                                {column.render('Header')}
                                {/* Add a sort direction indicator */}
                                <span>
                                    {column.isSorted ?
                                        column.isSortedDesc ?
                                            <TiArrowSortedDown/> :
                                            <TiArrowSortedUp/> :
                                        <TiArrowUnsorted/>}
                                </span>
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()} className='text-dark'>
                {rows.map((row, i) => {
                    prepareRow(row);

                    return (
                        <tr key={i} {...row.getRowProps()} {...getRowProps?.(row)}>
                            {row.cells.map((cell, i) => {
                                return (
                                    <td className='text-center align-middle py-1' key={i} style={{textOverflow: 'ellipsis', overflow: 'hidden'}} {...cell.getCellProps()}
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
