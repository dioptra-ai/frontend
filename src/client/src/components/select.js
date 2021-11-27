import React, {useCallback, useState} from 'react';
import PropTypes from 'prop-types';
import DropdownToggle from 'react-bootstrap/DropdownToggle';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownMenu from 'react-bootstrap/DropdownMenu';
import DropdownItem from 'react-bootstrap/DropdownItem';
import FontIcon from './font-icon';
import {IconNames} from '../constants';
import {noop} from 'constants';

const Select = ({
    textColor = 'dark',
    backgroundColor = 'white',
    borderColor = 'light',
    onChange = noop,
    options,
    initialValue,
    isTextBold,
    dropdownToggleClassname = ''
}) => {
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
        <Dropdown className='w-100'>
            <DropdownToggle bsPrefix='p-0' className={`w-100 text-start p-3 rounded-3 text-${textColor} border-1 border-${borderColor} d-flex align-items-center ${dropdownToggleClassname}`} variant={backgroundColor}>
                <span
                    className={`pe-4 fs-6 w-100 fw-${isTextBold ? 'bold' : 'normal'}`}
                >{activeOption && activeOption.length ? activeOption[0].name : ''}</span>
                <FontIcon
                    className='text-dark bold-text'
                    icon={IconNames.ARROW_DOWN}
                    size={6}
                />
            </DropdownToggle>
            <DropdownMenu className='p-0 w-100 border-0 shadow fs-6'>
                {options.map((o) => <DropdownItem
                    disabled={o.isDisabled}
                    eventKey={o.value}
                    key={o.value}
                    onSelect={handleSelect}>
                    <span className={`text-${o.isDisabled ? 'grey' : textColor}`}>{o.name || '<empty>'}</span>
                </DropdownItem>)}
            </DropdownMenu>
        </Dropdown>
    );
};

Select.propTypes = {
    backgroundColor: PropTypes.string,
    borderColor: PropTypes.string,
    initialValue: PropTypes.any,
    isTextBold: PropTypes.bool,
    onChange: PropTypes.func,
    options: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.any.isRequired,
        value: PropTypes.any.isRequired
    })),
    textColor: PropTypes.string,
    dropdownToggleClassname: PropTypes.string
};

export default Select;
