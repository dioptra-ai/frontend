import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {useRowSelect, useSortBy, useTable} from 'react-table';
import {TiArrowSortedDown, TiArrowSortedUp, TiArrowUnsorted} from 'react-icons/ti';
import Form from 'react-bootstrap/Form';

const Table = ({columns, data, onSelectedRowsChange, getRowProps}) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        selectedFlatRows
    } = useTable(
        {
            columns,
            data
        },
        useSortBy,
        ...(onSelectedRowsChange ? [
            useRowSelect,
            (hooks) => {
                hooks.visibleColumns.push((columns) => [
                    // Let's make a column for selection
                    {
                        id: 'selection',
                        // eslint-disable-next-line react/prop-types
                        Header: ({getToggleAllRowsSelectedProps}) => (
                            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                        ),
                        // eslint-disable-next-line react/prop-types
                        Cell: ({row}) => (
                            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} /> // eslint-disable-line react/prop-types
                        ),
                        disableSortBy: true,
                        width: 40
                    },
                    ...columns
                ]);
            }
        ] : [])
    );
    const selectedRows = selectedFlatRows?.map((row) => row.original);

    useEffect(() => {
        if (onSelectedRowsChange) {
            onSelectedRowsChange(selectedRows);
        }
    }, [JSON.stringify(selectedRows)]);

    return (
        <table {...getTableProps()} className='table fs-6'>
            <thead className='text-secondary border-top border-bottom'>
                {headerGroups.map((headerGroup, i) => (
                    <tr key={i} {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column, i) => (
                            // Add the sorting props to control sorting. For this example
                            // we can add them into the header props
                            <th className={`text-center py-3 border-0 ${column.disableSortBy ? '' : 'cursor-pointer'}`} key={i}
                                {...column.getHeaderProps({
                                    ...column.getSortByToggleProps(),
                                    style: {
                                        width: column.width,
                                        maxWidth: column.maxWidth,
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden'
                                    }
                                })}
                                title={column.render('Header')}
                            >
                                {column.render('Header')}
                                {/* Add a sort direction indicator */}
                                {column.disableSortBy ? null : (
                                    <span>
                                        {column.isSorted ?
                                            column.isSortedDesc ?
                                                <TiArrowSortedDown/> :
                                                <TiArrowSortedUp/> :
                                            <TiArrowUnsorted/>}
                                    </span>)}
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
                                    <td className='text-center align-middle py-1' key={i} {...cell.getCellProps()}>
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
    getRowProps: PropTypes.func,
    onSelectedRowsChange: PropTypes.func
};

export default Table;

// eslint-disable-next-line react/display-name
const IndeterminateCheckbox = React.forwardRef(
    ({indeterminate, ...rest}, ref) => { // eslint-disable-line react/prop-types
        const defaultRef = React.useRef();
        const resolvedRef = ref || defaultRef;

        React.useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate;
        }, [resolvedRef, indeterminate]);

        return (
            <Form.Check type='checkbox' ref={resolvedRef} {...rest} />
        );
    }
);
