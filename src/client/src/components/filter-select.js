import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import Select from 'react-select';
import FontIcon from './font-icon';

const Filter = ({filter, onDelete, applied = false}) => (
    <span className={`filter fs-6 ${applied ? 'applied' : ''}`}>
        {filter} <button onClick={onDelete}>
            <FontIcon className='text-dark' icon='Close' size={10}/>
        </button>
    </span>
);

Filter.propTypes = {
    applied: PropTypes.bool,
    filter: PropTypes.string,
    onDelete: PropTypes.func
};

const options = [{
    value: 'tag.gender=male', label: 'Gender Male'
}, {
    value: 'tag.gender=female', label: 'Gender Female'
}, {
    value: 'tag.gender=other', label: 'Gender Other'
}];

const customStyles = {
    container: (provided) => ({
        ...provided,
        flex: 1,
        marginRight: 20
    }),
    control: (provided) => ({
        ...provided,
        border: 'none',
        outline: 'none',
        background: 'transparent',
        height: 43
    })
};

const FilterSelect = ({
    defaultFilters = [],
    onChange
}) => {
    const [filters, setFilters] = useState([]);

    useEffect(() => {
        const selectedFilters = defaultFilters.map(({key, value}) => `${key}=${value}`);

        setFilters([...selectedFilters]);
    }, []);

    const handleChange = (selectedFilters) => {
        setFilters([...selectedFilters]);
    };

    const handleClearFilters = () => {
        setFilters([]);
        onChange([]);
    };

    return (
        <div className='my-5'>
            <div className='filter-input mb-4'>
                <Select defaultValue={filters} isMulti name='filters' onChange={handleChange} options={options} placeholder='filter1=foo filter2=bar' styles={customStyles} />
                <Button
                    className='bg-dark text-white border-0 bold-text fs-7'
                    onClick={() => {

                    }}
                >
                    APPLY FILTERS
                </Button>

            </div>
            {filters.length !== 0 && (
                <div>
                    {filters.map((filter, index) => (
                        <Filter applied={true} filter={filter || filter.label} key={index} onDelete={() => {}} />
                    ))}
                    <span className='text-dark clear' onClick={handleClearFilters}>
                        CLEAR ALL
                    </span>
                </div>
            )}
        </div>
    );
};

FilterSelect.propTypes = {
    defaultFilters: PropTypes.array,
    inputPlaceholder: PropTypes.string,
    onChange: PropTypes.func.isRequired
};

export default FilterSelect;
