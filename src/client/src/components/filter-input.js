import React, {useEffect, useState} from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import {useParams} from 'react-router-dom';
import {setupComponent} from 'helpers/component-helper';
import FontIcon from './font-icon';
import metricsClient from 'clients/metrics';
import {Filter} from 'state/stores/filters-store';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

const RenderedFilter = ({filter, onDelete, applied = false}) => {

    return (
        <OverlayTrigger
            placement='bottom'
            overlay={(
                <Tooltip id={filter.toString()}>
                    {filter.toString()}
                </Tooltip>
            )}>
            <div
                className={`d-flex filter fs-6 ${applied ? 'applied' : ''}`}
                style={{
                    whiteSpace: 'nowrap'
                }}
            >
                <div className='text-truncate mr-1' style={{
                    maxWidth: 200,
                    overflow: 'hidden'
                }}>{filter.toString()}</div>
                <button onClick={onDelete}>
                    <FontIcon className='text-dark' icon='Close' size={10} />
                </button>
            </div>
        </OverlayTrigger>
    );
};

RenderedFilter.propTypes = {
    applied: PropTypes.bool,
    filter: PropTypes.instanceOf(Filter),
    onDelete: PropTypes.func
};

const FilterInput = ({
    inputPlaceholder = 'foo = bar',
    onChange,
    modelStore,
    filtersStore
}) => {
    const [newFilter, setNewFilter] = useState(new Filter());
    const [filters, setFilters] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionIndex, setSuggestionIndex] = useState(-1);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const appliedFilters = filtersStore.filters;

    const {_id} = useParams();

    const {mlModelId} = modelStore.getModelById(_id);

    const getSuggestions = async () => {
        const {left: key, op, right: value, fromString} = newFilter;

        try {
            if (!newFilter.isLeftValid) {
                const allSuggestions = await metricsClient('queries/get-suggestions-without-key', {
                    key: fromString
                });
                const allSuggestionValues = allSuggestions.map(({value}) => value);
                const non1Options = await metricsClient('queries/all-key-options', {
                    // COUNT DISTINCT required here otherwise COUNT() returns weird results for model_id
                    keys_calc: allSuggestionValues.map((value) => `COUNT(DISTINCT "${value}") as "${value}"`).join(', '),
                    ml_model_id: mlModelId
                });
                // COUNT DISTINCT counts 1 for NULL
                const filteredKeys = allSuggestionValues.filter((v) => non1Options[v] > 1);

                setSuggestions([...filteredKeys]);
            } else if (!newFilter.isOpValid) {
                setSuggestions([' = ', ' in ', ' < ', ' > ']);
            } else {
                const allSuggestions = await metricsClient('queries/get-suggestions-with-key', {
                    key,
                    value,
                    ml_model_id: mlModelId
                });
                const allSuggestionValues = allSuggestions.map(({value}) => value);

                setSuggestions(allSuggestionValues);
            }
        } catch (e) {
            setSuggestions([]);
        }
    };

    useEffect(() => {
        if (showSuggestions) {
            try {
                getSuggestions();
            } catch (e) {
                setSuggestions([]);
                console.error(e);
            }
        }
    }, [newFilter.toString(), showSuggestions]);

    const handleKeyDown = (e) => {
        const {keyCode, target: {value}} = e;

        if (keyCode === 38 && suggestionIndex > 0) {
            //on arrow up
            setSuggestionIndex(suggestionIndex - 1);
        } else if (keyCode === 40 && suggestionIndex < suggestions.length - 1) {
            //on arrow down
            setSuggestionIndex(suggestionIndex + 1);
        } else if (e.key === 'Escape') {
            //escape
            setSuggestions([]);
            setSuggestionIndex(-1);
        } else if ((keyCode === 13 || keyCode === 9) && suggestionIndex !== -1) {
            // on enter or tab to select the suggestion
            handleSuggestionSelected(suggestions[suggestionIndex]);
            setSuggestionIndex(-1);
        } else if (keyCode === 13 && !value && filters.length) {
            // on enter to apply all
            onChange([...appliedFilters, ...filters]);
            setFilters([]);
            setNewFilter(new Filter());
            setSuggestionIndex(-1);
            setShowSuggestions(false);
        }
    };

    const handleRemoveFilter = (index) => {
        const updatedFilters = [...filters];

        updatedFilters.splice(index, 1);
        setFilters(updatedFilters);
        setNewFilter(new Filter());
    };

    const handleSuggestionSelected = (suggestion) => {

        if (!newFilter.isLeftValid) {

            setNewFilter(new Filter({left: suggestion}));
        } else if (!newFilter.isOpValid) {

            setNewFilter(new Filter({left: newFilter.left, op: suggestion}));
        } else {

            newFilter.right = suggestion;
            setFilters([...filters, newFilter]);
            setNewFilter(new Filter());
        }
    };

    const handleRemoveApplied = (index) => {
        const updatedApplied = [...appliedFilters];

        updatedApplied.splice(index, 1);
        onChange(updatedApplied);
    };

    return (
        <div className='my-3'>
            <OutsideClickHandler useCapture onOutsideClick={() => {
                setShowSuggestions(false);
            }}>
                <div className='filter-input'>
                    {filters.map((filter, index) => (
                        <RenderedFilter filter={filter} key={index} onDelete={() => handleRemoveFilter(index)} />
                    ))}
                    <input
                        onChange={(e) => {

                            setNewFilter(new Filter({fromString: e.target.value}));
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={filters.length === 0 ? inputPlaceholder : ''}
                        type='text'
                        value={newFilter.toString()}
                        onFocus={() => setShowSuggestions(true)}
                    />
                    <Button
                        className='bg-dark text-white border-0 bold-text fs-7'
                        onClick={() => {
                            onChange([...appliedFilters, ...filters]);
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
                                    onClick={() => handleSuggestionSelected(suggestion)}
                                >
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </OutsideClickHandler>
            <div
                className='d-flex flex-wrap position-relative mt-1'
                style={{columnGap: '0.25rem', rowGap: '0.25rem'}}
            >
                {appliedFilters.length !== 0 ? (
                    <>
                        {appliedFilters.map((filter, index) => (
                            <RenderedFilter
                                applied
                                filter={filter}
                                key={index}
                                onDelete={() => handleRemoveApplied(index)}
                            />
                        ))}
                        <span
                            className='text-dark clear mx-2 d-flex align-items-center'
                            onClick={() => onChange([])}
                        >
                            CLEAR ALL
                        </span>
                    </>
                ) : <div/>}
            </div>
        </div>
    );
};

FilterInput.propTypes = {
    inputPlaceholder: PropTypes.string,
    modelStore: PropTypes.object.isRequired,
    filtersStore: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
};

export default setupComponent(FilterInput);
