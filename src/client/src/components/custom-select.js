import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import FontIcon from 'components/font-icon';
import {IconNames} from 'constants';
import useClickOutside from 'customHooks/useClickOutside';

const CustomSelect = ({items, onChange, name, value, placeholder = 'Select one option'}) => {
    const {ref, isComponentVisible, setIsComponentVisible} = useClickOutside(true);
    const [isListOpen, setListOpen] = useState(false);
    const [title, setTitle] = useState(placeholder);

    const selectItem = (item) => {
        const {label, value: itemValue} = item;

        setTitle(label);

        if (value !== itemValue) {
            onChange({target: {value: item, name}});
        }
        toggleList();
    };

    const toggleList = () => {
        setListOpen(!isListOpen);
    };

    useEffect(() => {
        if (isListOpen) {
            setIsComponentVisible(true);
        }
    }, [isListOpen]);

    useEffect(() => {
        if (isListOpen && !isComponentVisible) {
            setListOpen(false);
        }
    }, [isComponentVisible]);

    const listItems = () => {
        const tempList = [...items];

        return tempList.map((item) => (
            <button
                type='button'
                className={'select-list-item p-3 text-dark'}
                key={item.value}
                onClick={() => selectItem(item)}
            >
                {item.label}
            </button>
        ));
    };

    return (
        <div className='w-100 form-control bg-light' ref={ref}>
            <button type='button' className='select-header' onClick={toggleList}>
                <div>{title}</div>
                <FontIcon
                    className='text-secondary position-absolute select-icon'
                    icon={isListOpen ? IconNames.ARROW_UP : IconNames.ARROW_DOWN}
                    size={10}
                />
            </button>
            {isListOpen && (
                <div className='bg-light w-100 d-flex select-list'>
                    {listItems()}
                </div>
            )}
        </div>
    );
};

CustomSelect.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        })
    ).isRequired,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

export default CustomSelect;
