import {useState} from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

const Filter = ({filter, onDelete}) => (
    <span className='filter'>
        {filter} <button onClick={onDelete}>x</button>
    </span>
);

Filter.propTypes = {
    filter: PropTypes.string,
    onDelete: PropTypes.func
};

const FilterInput = ({
    inputPlaceholder = 'Enter Filter (example: US, $100-$1,000...)'
}) => {
    const [filters, setFilters] = useState([]);
    const [newFilter, setNewFilter] = useState('');
    const [appliedFilters, setApplied] = useState([]);

    const handleChange = (e) => {
        setNewFilter(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.keyCode === 32 && e.target.value !== '') {
            const filter = newFilter.trim();

            if (filters.indexOf(filter) === -1) {
                const updatedFilters = [...filters];

                updatedFilters.push(filter);
                setFilters(updatedFilters);
                setNewFilter('');
            }
            e.target.value = '';
        } else if (e.keyCode === 13) {
            setApplied([...appliedFilters, ...filters]);
            setFilters([]);
        }
    };

    const handleRemoveFilter = (e) => {
        const filter = e.target.parentNode.textContent.trim();
        const index = filters.indexOf(filter);
        const updatedFilters = [...filters];

        updatedFilters.splice(index, 1);
        setFilters(updatedFilters);
        setNewFilter({newTag: ''});
    };

    const handleRemoveApplied = (e) => {
        const filter = e.target.parentNode.textContent.trim();
        const index = appliedFilters.indexOf(filter);
        const updatedApplied = [...appliedFilters];

        updatedApplied.splice(index, 1);
        setApplied(updatedApplied);
    };

    return (
        <>
            <div className='filter-input'>
                {filters.map((filter, index) => (
                    <Filter filter={filter} key={index} onDeconste={handleRemoveFilter} />
                ))}
                <input
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={filters.length === 0 ? inputPlaceholder : ''}
                    type='text'
                />
                <Button
                    className='bg-dark text-white border-0'
                    onClick={() => {
                        setApplied([...appliedFilters, ...filters]);
                        setFilters([]);
                    }}
                >
          APPLY FILTERS
                </Button>
            </div>
            {appliedFilters.length !== 0 && (
                <div>
                    {appliedFilters.map((filter, index) => (
                        <Filter filter={filter} key={index} onDelete={handleRemoveApplied} />
                    ))}
                    <span className='text-dark clear' onClick={() => setApplied([])}>
            CLEAR ALL
                    </span>
                </div>
            )}
        </>
    );
};

FilterInput.propTypes = {
    inputPlaceholder: PropTypes.string
};

export default FilterInput;
