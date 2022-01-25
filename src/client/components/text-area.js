import React, {useCallback, useState} from 'react';
import PropTypes from 'prop-types';
import {FormText} from 'react-bootstrap';
import {noop} from 'constants';

const TextArea = ({className, placeholder, onChange = noop, initialValue = '', rows}) => {
    const [value, setValue] = useState(initialValue);
    const handleChange = useCallback((e) => {
        const newValue = e.target.value;

        setValue(newValue);
        onChange(newValue);
    });

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
    rows: PropTypes.number
};

export default TextArea;
