import React, {useCallback, useState} from 'react';
import PropTypes from 'prop-types';
import {FormText} from 'react-bootstrap';
import {noop} from 'constants';

const DEFAULT_INITIAL_VALUE = '';
const TextInput = ({className, placeholder, onChange = noop, initialValue = DEFAULT_INITIAL_VALUE}) => {
    const [value, setValue] = useState(initialValue);

    if (initialValue !== DEFAULT_INITIAL_VALUE && initialValue !== value) {
        setValue(initialValue);
    }
    const handleChange = useCallback((e) => {
        const newValue = e.target.value;

        setValue(newValue);
        onChange(newValue);
    });

    return (
        <FormText as='input'
            className={className}
            onChange={handleChange}
            placeholder={placeholder}
            value={value}/>
    );
};

TextInput.propTypes = {
    className: PropTypes.string,
    initialValue: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string
};

export default TextInput;
