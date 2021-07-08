import React, {useCallback, useState} from 'react';
import PropTypes from 'prop-types';
import DropdownToggle from 'react-bootstrap/DropdownToggle';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownMenu from 'react-bootstrap/DropdownMenu';
import DropdownItem from 'react-bootstrap/DropdownItem';
import {noop} from 'constants';

const Select = ({textColor = 'dark', backgroundColor = 'white', borderColor = 'light', onChange = noop, options, initialValue}) => {
    const [value, setValue] = useState(initialValue ? initialValue : options[0].value);
    const handleSelect = useCallback((newValue) => {
        setValue(newValue);
        onChange(newValue);
    }, []);

    const activeOption = options.filter((o) => o.value === value);

    if (value !== initialValue || !value) {
        setValue(initialValue);
    }

    return (
        <Dropdown>
            <DropdownToggle className={`w-100 text-start py-3 ps-3 rounded-3 text-${textColor} border-1 border-${borderColor} d-flex align-items-center`} variant={backgroundColor}>
                <span className='pe-4 w-100'>{activeOption && activeOption.length ? activeOption[0].name : ''}</span>
            </DropdownToggle>
            <DropdownMenu>
                {options.map((o) => <DropdownItem
                    eventKey={o.value}
                    key={o.value}
                    onSelect={handleSelect}>
                    <span className={`text-${textColor}`}>{o.name}</span>
                </DropdownItem>)}
            </DropdownMenu>
        </Dropdown>
    );
};

Select.propTypes = {
    backgroundColor: PropTypes.string,
    borderColor: PropTypes.string,
    initialValue: PropTypes.any,
    onChange: PropTypes.func,
    options: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.any.isRequired,
        value: PropTypes.any.isRequired
    })),
    textColor: PropTypes.string
};

export default Select;
