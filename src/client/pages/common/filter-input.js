import {useDebounceCallback} from '@react-hook/debounce';
import {Overlay, OverlayTrigger, Tooltip} from 'react-bootstrap';
import React, {useEffect, useRef, useState} from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import {setupComponent} from 'helpers/component-helper';
import FontIcon from 'components/font-icon';
import metricsClient from 'clients/metrics';
import {Filter} from 'state/stores/filters-store';
import useModel from 'hooks/use-model';
import Spinner from 'components/spinner';

const RenderedFilter = ({filter, onDelete, applied = false}) => {
    const truncatedFilters = filter.toString(true);

    return (
        <OverlayTrigger
            placement='bottom'
            overlay={(
                <Tooltip id={truncatedFilters}>
                    {truncatedFilters}
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
                }}>{truncatedFilters}</div>
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
    inputPlaceholder = 'filter1 = foo   filter2 in a,b,c',
    onChange,
    value,
    filtersStore
}) => {
    const [newFilter, setNewFilter] = useState(new Filter());
    const [filters, setFilters] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionIndex, setSuggestionIndex] = useState(-1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const inFilterTooltipTarget = useRef(null);
    const inFlightRequest = useRef(null);
    const appliedFilters = value ? value.map((v) => new Filter(v)) : filtersStore.filters;

    const model = useModel();

    const getSuggestions = useDebounceCallback(async () => {
        const {left: key, isOpValid, right: value} = newFilter;
        const setSuggestionsIfInFlight = (suggestions) => {
            if (inFlightRequest.current === newFilter) {
                setSuggestions(suggestions);
                setSuggestionsLoading(false);
            }
        };

        inFlightRequest.current = newFilter;

        try {
            if (key && isOpValid) {

                setShowSuggestions(true);
                setSuggestionsLoading(true);

                const allSuggestions = await metricsClient('queries/get-values-suggestions', {
                    key,
                    value: Array.isArray(value) ? value[value.length - 1] : value,
                    model_id: model?.mlModelId
                });

                const allSuggestionValues = allSuggestions.map(({value}) => value);

                setSuggestionsIfInFlight(allSuggestionValues);
            } else if (newFilter.isLeftComplete) {

                setShowSuggestions(true);
                setSuggestionsIfInFlight(['=', '!=', '<', '>', 'like', 'not like', 'in', 'not in']);
            } else if (key) {

                setShowSuggestions(true);
                setSuggestionsLoading(true);

                const allSuggestions = await metricsClient('queries/get-keys-suggestions', {
                    key,
                    model_id: model?.mlModelId
                });

                setSuggestionsIfInFlight(allSuggestions.map((s) => s['value']));
            }
        } catch (e) {
            setSuggestionsIfInFlight([]);
        }
    }, 500);

    useEffect(() => {
        try {
            getSuggestions();
        } catch (e) {
            setSuggestions([]);
            console.error(e);
        }
    }, [newFilter.toString()]);

    const handleEndCharacterKey = (e) => {
        const parsedFilter = Filter.parse(e.target.value);

        if (parsedFilter.isComplete) {
            setFilters([...filters, parsedFilter]);
            setNewFilter(new Filter());
        } else {
            setNewFilter(parsedFilter);
        }
    };

    const handleKeyDown = (e) => {

        if (e.keyCode === 38 && suggestionIndex > 0) {
            //on arrow up
            setSuggestionIndex(suggestionIndex - 1);
        } else if (e.keyCode === 40 && suggestionIndex < suggestions.length - 1) {
            //on arrow down
            setSuggestionIndex(suggestionIndex + 1);
        } else if (e.key === 'Escape') {
            //escape
            e.preventDefault();
            setSuggestions([]);
            setSuggestionIndex(-1);
        } else if ((e.keyCode === 13 || e.keyCode === 9) && suggestionIndex !== -1) {
            // on enter to select the suggestion
            e.preventDefault();
            handleSuggestionSelected(suggestions[suggestionIndex]);
            setSuggestionIndex(-1);
        } else if (e.keyCode === 13 && !e.target.value.trim() && filters.length) {
            // on enter to apply all
            e.preventDefault();
            onChange([...appliedFilters, ...filters]);
            setFilters([]);
            setNewFilter(new Filter());
            setSuggestionIndex(-1);
            setShowSuggestions(false);
        } else if (e.keyCode === 32 || e.keyCode === 13) {
            //on space or enter to validate filter
            handleEndCharacterKey(e);
        }
    };

    const handleRemoveFilter = (index) => {
        const updatedFilters = [...filters];

        updatedFilters.splice(index, 1);
        setFilters(updatedFilters);
        setNewFilter(new Filter());
    };

    const handleSuggestionSelected = (suggestion) => {
        if (newFilter.left && newFilter.isOpValid) {
            switch (newFilter.op) {
            case 'in':
            case 'not in':
                newFilter.right = [suggestion];
                break;
            default:
                newFilter.right = suggestion;
                break;
            }

            setFilters([...filters, newFilter]);
            setNewFilter(new Filter());
        } else if (newFilter.isLeftComplete && !newFilter.isOpValid) {
            setNewFilter(new Filter({left: newFilter.left, op: suggestion}));
        } else {
            setNewFilter(new Filter({left: suggestion}));
        }
    };

    const handleRemoveApplied = (index) => {
        const updatedApplied = [...appliedFilters];

        updatedApplied.splice(index, 1);
        onChange(updatedApplied);
    };

    return (
        <>
            <OutsideClickHandler useCapture onOutsideClick={() => {
                setShowSuggestions(false);
            }}>
                <div className='filter-input' ref={inFilterTooltipTarget}>
                    {filters.map((filter, index) => (
                        <RenderedFilter filter={filter} key={index} onDelete={() => handleRemoveFilter(index)} />
                    ))}
                    <Overlay target={inFilterTooltipTarget.current} show={newFilter.op === 'in' || newFilter.op === 'not in'} placement='top'>
                        {(props) => (
                            <Tooltip id='overlay-example' {...props}>
                                Enter a comma-separated, unspaced list of values: value1,value2,value4
                            </Tooltip>
                        )}
                    </Overlay>
                    <input
                        onChange={(e) => {
                            setNewFilter(Filter.parse(e.target.value));
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={filters.length === 0 ? inputPlaceholder : ''}
                        type='text'
                        value={newFilter.toString()}
                        name='filter' // to hint chrome to stop password-filling
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
                    {showSuggestions ? (
                        <div className='suggestions bg-white text-dark py-3'>
                            {
                                suggestionsLoading ? (
                                    <Spinner/>
                                ) : (
                                    <ul className='m-0'>
                                        {suggestions.length ? suggestions.map((suggestion, index) => (
                                            <li
                                                className={suggestionIndex === index ? 'active' : ''}
                                                key={index}
                                                onClick={() => handleSuggestionSelected(suggestion)}
                                            >
                                                {suggestion}
                                            </li>
                                        )) : <span className='px-3 text-secondary'>No results</span>}
                                    </ul>
                                )
                            }
                        </div>
                    ) : null}
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
        </>
    );
};

FilterInput.propTypes = {
    inputPlaceholder: PropTypes.string,
    filtersStore: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.array
};

export default setupComponent(FilterInput);
