import React, {useEffect, useMemo, useState} from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import FontIcon from './font-icon';
import {withRouter} from 'react-router-dom';
import qs from 'qs';

const Filter = ({filter, onDelete, applied = false}) => (
    <span className={`filter fs-6 ${applied ? 'applied' : ''}`}>
        {filter}{' '}
        <button onClick={onDelete}>
            <FontIcon className='text-dark' icon='Close' size={10} />
        </button>
    </span>
);

Filter.propTypes = {
    applied: PropTypes.bool,
    filter: PropTypes.string,
    onDelete: PropTypes.func
};

const FilterInput = ({
    inputPlaceholder = 'filter1=foo filter2=bar',
    defaultFilters = [],
    onChange,
    location,
    history
}) => {
    const [newFilter, setNewFilter] = useState('');
    const [filters, setFilters] = useState([]);
    const [appliedFilters, setAppliedFilters] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionIndex, setSuggestionIndex] = useState(-1);

    const {startTime, endTime, feature, tag, ...restQueryString} = useMemo(
        () => qs.parse(location?.search, {ignoreQueryPrefix: true}),
        [location?.search]
    );

    useEffect(() => {
        const existingFilters = defaultFilters.map(({key, value}) => `${key}=${value}`);
        const queryFilters = [];

        Object.keys(restQueryString).forEach((key) => {
            if (Array.isArray(restQueryString[key])) {
                restQueryString[key].forEach((val) => {
                    queryFilters.push(`${key}=${val}`);
                });
            } else queryFilters.push(`${key}=${restQueryString[key]}`);
        });

        const filteredQueryFilter = queryFilters.filter(
            (qf) => !existingFilters.includes(qf)
        );

        setAppliedFilters([...existingFilters, ...filteredQueryFilter]);
    }, []);

    const getSuggestions = () => {
        const externals = [];

        setSuggestions(externals);
    };

    useEffect(() => {
        getSuggestions();
    }, [newFilter]);

    const handleInputChange = (e) => {
        setNewFilter(e.target.value.trim());
    };

    const handleKeyUp = (e) => {
        if (e.keyCode === 38 && suggestionIndex > 0) {
            //on arrow up
            setSuggestionIndex(suggestionIndex - 1);
        } else if (e.keyCode === 40 && suggestionIndex < suggestions.length - 1) {
            //on arrow down
            setSuggestionIndex(suggestionIndex + 1);
        } else if (e.key === 'Escape') {
            //escape
            setSuggestions([]);
            setSuggestionIndex(-1);
        } else if (e.keyCode === 13 && suggestionIndex !== -1) {
            //on enter while suggestion is selected
            setFilters([...filters, suggestions[suggestionIndex]]);
            setNewFilter('');
            setSuggestionIndex(-1);
        } else if (e.keyCode === 32 && newFilter !== '') {
            //on space
            if (
                filters.indexOf(newFilter) === -1 &&
        appliedFilters.indexOf(newFilter) === -1
            ) {
                const updatedFilters = [...filters];

                updatedFilters.push(newFilter);
                setFilters(updatedFilters);
            }
            setNewFilter('');
        } else if (e.keyCode === 13) {
            //on enter
            handleAppliedFiltersChange([...appliedFilters, ...filters]);
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

    const handleAppliedFiltersChange = (appliedFilters) => {
        setAppliedFilters(appliedFilters);
        const filters = appliedFilters
            .map((f) => f.split('='))
            .map(([key, value]) => ({key, value}));

        const filtersObj = filters.reduce((obj, {key, value}) => {
            if (obj.hasOwnProperty(key)) return {...obj, [key]: [obj[key], value]};

            return {...obj, [key]: value};
        }, {});

        history.replace({
            pathname: location.pathname,
            search: qs.stringify({
                ...filtersObj,
                startTime,
                endTime,
                feature,
                tag
            })
        });

        onChange(filters);
    };

    const handleRemoveApplied = (e) => {
        const filter = e.target.parentNode.parentNode.textContent.trim();
        const index = appliedFilters.indexOf(filter);
        const updatedApplied = [...appliedFilters];

        updatedApplied.splice(index, 1);
        handleAppliedFiltersChange(updatedApplied);
    };

    return (
        <div className='my-5'>
            <div className='filter-input mb-4'>
                {filters.map((filter, index) => (
                    <Filter filter={filter} key={index} onDelete={handleRemoveFilter} />
                ))}
                <input
                    onChange={handleInputChange}
                    onKeyUp={handleKeyUp}
                    placeholder={filters.length === 0 ? inputPlaceholder : ''}
                    type='text'
                    value={newFilter}
                />
                <Button
                    className='bg-dark text-white border-0 bold-text fs-7'
                    onClick={() => {
                        handleAppliedFiltersChange([...appliedFilters, ...filters]);
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
                            <li
                                className={suggestionIndex === index ? 'active' : ''}
                                key={index}
                                onClick={() => {
                                    setFilters([...filters, suggestion]);
                                    setNewFilter('');
                                    setSuggestionIndex(-1);
                                }}
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {appliedFilters.length !== 0 && (
                <div>
                    {appliedFilters.map((filter, index) => (
                        <Filter
                            applied={true}
                            filter={filter}
                            key={index}
                            onDelete={handleRemoveApplied}
                        />
                    ))}
                    <span
                        className='text-dark clear'
                        onClick={() => handleAppliedFiltersChange([])}
                    >
            CLEAR ALL
                    </span>
                </div>
            )}
        </div>
    );
};

FilterInput.propTypes = {
    defaultFilters: PropTypes.array,
    history: PropTypes.object.isRequired,
    inputPlaceholder: PropTypes.string,
    location: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
};

export default withRouter(FilterInput);
