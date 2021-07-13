import React from 'react';
import PropTypes from 'prop-types';
import {noop} from '../../constants';

const DynamicArray = ({data = [{}], onChange = noop, renderRow = noop, newRowInitialState = {}}) => {
    const genericStateModifier = (modifierFunc) => onChange((x) => modifierFunc([...x]));
    const handleAddRow = () => genericStateModifier((x) => {
        x.push({...newRowInitialState});

        return x;
    });

    if (!data.length) {
        return renderRow({
            handleRowDataChange: noop,
            handleDeleteRow: noop,
            handleAddRow,
            isFirst: false,
            isLast: false,
            rowState: newRowInitialState,
            idx: -1,
            hasData: false
        });
    }

    return (
        <>
            {data.map((item, idx) => {
                const handleDeleteRow = () => genericStateModifier((x) => [
                    ...x.slice(0, idx),
                    ...x.slice(idx + 1, x.length)
                ]);
                const handleRowDataChange = (newRowData) => genericStateModifier((x) => {
                    x[idx] = {...x[idx], ...newRowData};

                    return x;
                });

                return renderRow({
                    handleRowDataChange,
                    handleDeleteRow,
                    handleAddRow,
                    isFirst: idx === 0,
                    isLast: idx === data.length - 1,
                    rowState: data[idx],
                    idx,
                    hasData: true
                });
            })}
        </>
    );
};

DynamicArray.propTypes = {
    data: PropTypes.array,
    newRowInitialState: PropTypes.any,
    onChange: PropTypes.func,
    renderRow: PropTypes.func
};

export default DynamicArray;
