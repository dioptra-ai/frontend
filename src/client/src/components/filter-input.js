import React, {useEffect, useState} from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import {useParams} from 'react-router-dom';
import {setupComponent} from 'helpers/component-helper';
import FontIcon from './font-icon';
// import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import metricsClient from 'clients/metrics';
// import CountEvents from 'components/count-events';

const Filter = ({filter, onDelete, applied = false}) => (
    <span className={`filter fs-6 ${applied ? 'applied' : ''} mt-2`}>
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
    modelStore
}) => {
    const [newFilter, setNewFilter] = useState('');
    const [filters, setFilters] = useState([]);
    const [appliedFilters, setAppliedFilters] = useState(
        defaultFilters.map(({key, value}) => `${key}=${value}`)
    );
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionIndex, setSuggestionIndex] = useState(-1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    // const allSqlFilters = useAllSqlFilters();

    const {_id} = useParams();

    const {mlModelId} = modelStore.getModelById(_id);

    const getSuggestions = () => {
        const [key, value] = newFilter.split('=');

        if (key && newFilter.includes('=')) {
            metricsClient('queries/get-suggestions-with-key', {
                key,
                value,
                ml_model_id: mlModelId
            })
                .then((data) => {
                    setSuggestions([...data.flat()]);
                })
                .catch(() => setSuggestions([]));
        } else {
            metricsClient('queries/get-suggestions-without-key', {
                key
            }).then(async (data) => {
                await metricsClient('queries/all-key-options', {
                    keys_calc: data.map(({allKeyOptions: key}) => `COUNT("${key}")`).join(', '),
                    ml_model_id: mlModelId
                })
                    .then((allKeyOptions) => {
                        const filteredKeys = data
                            .filter(() => allKeyOptions)
                            .map(({allKeyOptions}) => allKeyOptions);

                        setSuggestions([...filteredKeys]);
                    }).catch(console.error);
            }).catch(() => setSuggestions([]));
        }
    };

    useEffect(() => {
        if (showSuggestions) {
            getSuggestions();
        }
    }, [newFilter, showSuggestions]);

    const handleInputChange = (e) => {
        setNewFilter(e.target.value.trim());
    };

    const handleEnterOrTab = (e, key) => {
        if (e.keyCode === 9) {
            e.preventDefault();
        }
        //on enter while suggestion is selected
        if (e.target.value.includes('=')) {
            const currentFilter = `${key}=${suggestions[suggestionIndex]}`;

            setNewFilter(currentFilter);
            if (filters.indexOf(currentFilter) === -1 && appliedFilters.indexOf(currentFilter) === -1) {
                const updatedFilters = [...filters];

                updatedFilters.push(currentFilter);
                setFilters(updatedFilters);
            }
            setNewFilter('');
        } else {
            setNewFilter(`${suggestions[suggestionIndex]}=`);
        }
    };

    const handleKeyDown = (e) => {
        const [key, value] = e.target.value.split('=');

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
        } else if ((e.keyCode === 13 || e.keyCode === 9) && suggestionIndex !== -1) {
            handleEnterOrTab(e, key);
            setSuggestionIndex(-1);
        } else if (e.keyCode === 32 && newFilter !== '') { //on space
            if (key && value) {
                if (filters.indexOf(newFilter) === -1 && appliedFilters.indexOf(newFilter) === -1) {
                    const updatedFilters = [...filters];

                    updatedFilters.push(newFilter);
                    setFilters(updatedFilters);
                }
                setNewFilter('');
            } else {
                setNewFilter(`${key}=`);
            }
        } else if (e.keyCode === 13 && !e.target.value && filters.length) {
            handleAppliedFiltersChange([...appliedFilters, ...filters]);
            setFilters([]);
            setNewFilter('');
            setSuggestionIndex(-1);
            setShowSuggestions(false);
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

    const handleSuggestionClick = (suggestion) => {
        if (newFilter.includes('=')) {
            const [key] = newFilter.split('=');
            const currentFilter = `${key}=${suggestion}`;

            if (filters.indexOf(currentFilter) === -1 && appliedFilters.indexOf(currentFilter) === -1) {
                const updatedFilters = [...filters];

                updatedFilters.push(currentFilter);
                setFilters(updatedFilters);
            }
            setNewFilter('');
        } else {
            setNewFilter(`${suggestion}=`);
        }
    };

    const handleAppliedFiltersChange = (appliedFilters) => {
        setAppliedFilters(appliedFilters);
        onChange(
            appliedFilters.map((f) => f.split('=')).map(([key, value]) => ({key, value}))
        );
    };

    const handleRemoveApplied = (e) => {
        const filter = e.target.parentNode.textContent.trim();
        const index = appliedFilters.indexOf(filter);
        const updatedApplied = [...appliedFilters];

        updatedApplied.splice(index, 1);
        handleAppliedFiltersChange(updatedApplied);
    };

    return (
        <div className='my-3'>
            <OutsideClickHandler useCapture onOutsideClick={() => {
                setShowSuggestions(false);
            }}>
                <div className='filter-input'>
                    {filters.map((filter, index) => (
                        <Filter filter={filter} key={index} onDelete={handleRemoveFilter} />
                    ))}
                    <input
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={filters.length === 0 ? inputPlaceholder : ''}
                        type='text'
                        value={newFilter}
                        onFocus={() => setShowSuggestions(true)}
                    />
                    <Button
                        className='bg-dark text-white border-0 bold-text fs-7'
                        onClick={() => {
                            handleAppliedFiltersChange([...appliedFilters, ...filters]);
                            setFilters([]);
                            setNewFilter('');
                            setSuggestionIndex(-1);
                            setShowSuggestions(false);
                        }}
                    >
              APPLY FILTERS
                    </Button>
                    {showSuggestions && (
                        <ul className='suggestions bg-white text-dark'>
                            {suggestions.map((suggestion, index) => (
                                <li
                                    className={suggestionIndex === index ? 'active' : ''}
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </OutsideClickHandler>
            <div className='d-flex justify-content-between position-relative'>
                {appliedFilters.length !== 0 ? (
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
                ) : <div/>}
                {/* <span className='text-primary m-1 position-absolute r-0 fs-7' style={{right: 0}}>
                    Events: <CountEvents sqlFilters={allSqlFilters}/>
                </span> */}
            </div>
        </div>
    );
};

FilterInput.propTypes = {
    defaultFilters: PropTypes.array,
    inputPlaceholder: PropTypes.string,
    modelStore: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
};

export default setupComponent(FilterInput);
