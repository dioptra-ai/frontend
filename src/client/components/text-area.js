import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {FormText} from 'react-bootstrap';
import {noop} from 'constants';

const TextArea = ({className, placeholder, onChange = noop, initialValue = '', rows, inputValue = ''}) => {
    const [value, setValue] = useState(initialValue);
    const handleChange = useCallback((e) => {
        const newValue = e.target.value;

        setValue(newValue);
        onChange(newValue);
    });

    useEffect(() => {
        if (inputValue && typeof Object) {
            const value = inputValue instanceof Object ? JSON.stringify(inputValue) : inputValue
            setValue(value);
            onChange(value);
        }
    }, [inputValue]);

    return (
        <FormText as='textarea'
            className={className}
            onChange={handleChange}
            placeholder={placeholder}
            rows={rows}
            value={value}/>
    );
};

TextArea.propTypes = {
    className: PropTypes.string,
    initialValue: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    rows: PropTypes.number,
    inputValue: PropTypes.string
};

export default TextArea;
