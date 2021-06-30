import {useEffect, useState} from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

const Filter = ({filter, onDelete}) => (
    <span className='filter'>
        {filter} <button onClick={onDelete}/>
    </span>
);

Filter.propTypes = {
    filter: PropTypes.string,
    onDelete: PropTypes.func
};

const FilterInput = ({
    inputPlaceholder = 'Enter Filter'
}) => {
    const [newFilter, setNewFilter] = useState('');
    const [filters, setFilters] = useState([]);
    const [appliedFilters, setApplied] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionIndex, setSuggestionIndex] = useState(-1);

    const getSuggestions = () => {
        const externals = ['apple', 'apricot', 'avocado', 'bananna', 'cherry', 'orange'];
        //externals will be the response to get filtering suggestions request

        externals.forEach((ext, i) => {
            if (filters.includes(ext) || appliedFilters.includes(ext)) {
                externals.splice(i, 1);
            }
        });
        // 35, 36 and 37 row will not be used since the filtering will be done on server side based on sent search query
        const matchExp = new RegExp(newFilter, 'i');
        const matchedSuggestions = externals.filter((suggestion) => !newFilter || matchExp.test(suggestion));

        setSuggestions(matchedSuggestions);
        // setSuggestions(externals);

    };

    useEffect(() => {
        getSuggestions();
    }, [newFilter]);

    const handleChange = (e) => {
        setNewFilter(e.target.value.trim());
    };

    const handleKeyUp = (e) => {
        if (e.keyCode === 38 && suggestionIndex > 0) { //on arrow up
            setSuggestionIndex(suggestionIndex - 1);
        } else if (e.keyCode === 40 && suggestionIndex < suggestions.length - 1) { //on arrow down
            setSuggestionIndex(suggestionIndex + 1);
        } else if (e.key === 'Escape') { //escape
            setSuggestions([]);
            setSuggestionIndex(-1);
        } else if (e.keyCode === 13 && suggestionIndex !== -1) { //on enter while suggestion is selected
            setFilters([...filters, suggestions[suggestionIndex]]);
            setNewFilter('');
            setSuggestionIndex(-1);
        } else if (e.keyCode === 32 && newFilter !== '') { //on space
            if (filters.indexOf(newFilter) === -1 && appliedFilters.indexOf(newFilter) === -1) {
                const updatedFilters = [...filters];

                updatedFilters.push(newFilter);
                setFilters(updatedFilters);
            }
            setNewFilter('');
        } else if (e.keyCode === 13) { //on enter
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
        setNewFilter('');
    };

    const handleRemoveApplied = (e) => {
        const filter = e.target.parentNode.textContent.trim();
        const index = appliedFilters.indexOf(filter);
        const updatedApplied = [...appliedFilters];

        updatedApplied.splice(index, 1);
        setApplied(updatedApplied);
    };

    return (
        <Container className='my-5' fluid>
            <div className='filter-input mb-4'>
                {filters.map((filter, index) => (
                    <Filter filter={filter} key={index} onDelete={handleRemoveFilter} />
                ))}
                <input
                    onChange={handleChange}
                    onKeyUp={handleKeyUp}
                    placeholder={filters.length === 0 ? inputPlaceholder : ''}
                    type='text'
                    value={newFilter}
                />
                <Button
                    className='bg-dark text-white border-0'
                    onClick={() => {
                        setApplied([...appliedFilters, ...filters]);
                        setFilters([]);
                        setNewFilter('');
                        setSuggestionIndex(-1);
                    }}
                >
                    APPLY FILTERS
                </Button>
                {newFilter.length !== 0 && (
                    <ul className='suggestions bg-white text-dark'>
                        {suggestions.map((suggestion, index) => (
                            <li className={suggestionIndex === index ? 'active' : ''} key={index} onClick={() => {
                                setFilters([...filters, suggestion]);
                                setNewFilter('');
                                setSuggestionIndex(-1);
                            }}>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
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
        </Container>
    );
};

FilterInput.propTypes = {
    inputPlaceholder: PropTypes.string
};

export default FilterInput;
