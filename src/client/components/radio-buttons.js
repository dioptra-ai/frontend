import React, {useCallback, useState} from 'react';
import PropTypes from 'prop-types';
import {noop} from 'constants';

const RadioButtons = ({items, onChange = noop(), initialValue, activeItemColor = 'primary'}) => {
    const [value, setValue] = useState(initialValue);
    const handleChange = useCallback((newValue) => {
        setValue(newValue);
        onChange(newValue);
    }, []);
    const activeItemClasses = `text-${activeItemColor} border-${activeItemColor}`;

    return (
        <>
            {items.map((item) => {
                const isActive = item.value === value;

                return (
                    <span className={`border border-1 px-4 py-3 rounded-3 me-3 ${isActive ? activeItemClasses : ''}`}
                        key={item.value}
                        onClick={() => handleChange(item.value)}
                        role='button'>
                        {item.name}
                    </span>
                );
            })}
        </>
    );
};

RadioButtons.propTypes = {
    activeItemColor: PropTypes.string,
    initialValue: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.any.isRequired,
        value: PropTypes.any.isRequired
    })),
    onChange: PropTypes.func
};

export default RadioButtons;
