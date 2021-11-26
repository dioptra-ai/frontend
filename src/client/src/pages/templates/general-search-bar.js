import React, {useEffect, useMemo, useState} from 'react';
import {IconNames} from 'constants';
import {Button} from 'react-bootstrap';
import PropTypes from 'prop-types';

import FontIcon from 'components/font-icon';
import DateTimeRangePicker from 'components/date-time-range-picker';
import TextInput from 'components/text-input';
import {setupComponent} from 'helpers/component-helper';
import baseJsonClient from 'clients/base-json-client';
import Select from 'components/select';
import moment from 'moment';

const granularityOptions = [
    {name: 'Auto', value: 'auto'},
    {
        name: '1 Second',
        value: moment.duration(1, 'second').asSeconds().toString(),
        isDisabled: true
    },
    {
        name: '10 Seconds',
        value: moment.duration(10, 'second').asSeconds().toString(),
        isDisabled: true
    },
    {
        name: '1 Minute',
        value: moment.duration(1, 'minute').asSeconds().toString(),
        isDisabled: true
    },
    {
        name: '10 Minutes',
        value: moment.duration(10, 'minute').asSeconds().toString(),
        isDisabled: true
    },
    {
        name: '1 Hour',
        value: moment.duration(1, 'hour').asSeconds().toString(),
        isDisabled: false
    },
    {
        name: '3 Hours',
        value: moment.duration(3, 'hour').asSeconds().toString(),
        isDisabled: true
    },
    {
        name: '1 Day',
        value: moment.duration(1, 'day').asSeconds().toString(),
        isDisabled: false
    },
    {
        name: '5 Days',
        value: moment.duration(5, 'day').asSeconds().toString(),
        isDisabled: true
    },
    {
        name: '1 Month',
        value: moment.duration(1, 'month').asSeconds().toString(),
        isDisabled: true
    }
];

const GeneralSearchBar = ({shouldShowOnlySearchInput, timeStore}) => {
    const [searchString, setSearchString] = useState('');
    const [results, setResults] = useState([]);
    const [selectedResultIndex, setSelectedResultIndex] = useState(-1);

    const GRANULARITY_OPTIONS = useMemo(
        () => granularityOptions.map((opt) => ({
            ...opt,
            isDisabled:
                    opt.value !== 'none' ?
                        timeStore.end.diff(timeStore.start) / 100000 >
                          Number(opt.value) :
                        false
        })),
        [timeStore.start, timeStore.end]
    );

    useEffect(() => {
        if (searchString.length > 1) {
            baseJsonClient(`/api/ml-model/search?queryString=${searchString}`)
                .then(setResults)
                .catch(() => setResults([]));
        }
    }, [searchString]);

    const handleResultClick = (id) => {
        window.location.assign(`/models/${id}/performance-overview`);
    };

    const handleKeyDown = (e) => {
        //arrow up
        if (e.keyCode === 38 && selectedResultIndex > 0) {
            setSelectedResultIndex(selectedResultIndex - 1);
        } else if (e.keyCode === 40 && selectedResultIndex < results.length - 1) {
            //on arrow down
            setSelectedResultIndex(selectedResultIndex + 1);
        } else if (e.key === 'Escape') {
            //escape
            setResults([]);
            setSelectedResultIndex(-1);
        } else if (e.keyCode === 13 && selectedResultIndex !== -1) {
            const {_id} = results[selectedResultIndex];

            handleResultClick(_id);
        }
    };

    const generateHTML = (model) => {
        const {mlModelId, mlModelType, name, description} = model;
        const nameMatch = name?.replace(new RegExp(searchString, 'gi'), (match) => match.bold());
        const descriptionMatch = description?.replace(
            new RegExp(searchString, 'gi'),
            (match) => match.bold()
        );
        const mlModelIdMatch = mlModelId?.replace(
            new RegExp(searchString, 'gi'),
            (match) => match.bold()
        );
        const mlModelTypeMatch = mlModelType?.replace(
            new RegExp(searchString, 'gi'),
            (match) => match.bold()
        );

        return `<p>${nameMatch}</p>
            <p>${descriptionMatch}</p>
            <p>
                <span>ID: </span>${mlModelIdMatch}
                <span>Type: </span>${mlModelTypeMatch}
            </p>`;
    };

    const handleChange = (value) => {
        timeStore.aggregationPeriod = value !== 'auto' ? Number(value) : value;
    };

    return (
        <div className='py-3 px-4 d-flex align-items-center border-bottom'>
            <FontIcon className='text-secondary' icon={IconNames.SEARCH} size={25} />
            <div className='flex-grow-1 mx-3 general-search-bar'>
                <TextInput
                    className='form-control border-0 py-2 search-input font-weight-bold'
                    placeholder='Search'
                    value={searchString}
                    onChange={setSearchString}
                    onKeyDown={handleKeyDown}
                />
                <ul className='results bg-white text-dark'>
                    {results.map(({_id, ...rest}, index) => (
                        <li
                            className={selectedResultIndex === index ? 'active' : ''}
                            key={_id}
                            onClick={() => handleResultClick(_id)}
                            dangerouslySetInnerHTML={{
                                __html: generateHTML(rest)
                            }}
                        />
                    ))}
                </ul>
            </div>
            {shouldShowOnlySearchInput ? null : (
                <>
                    <DateTimeRangePicker
                        end={timeStore.end}
                        onChange={({start, end, lastMs}) => {
                            if (lastMs) {
                                timeStore.setLastMs(lastMs);
                            } else {
                                timeStore.setTimeRange({start, end});
                            }
                        }}
                        start={timeStore.start}
                    />
                    <div style={{width: '200px'}} className='ms-3'>
                        <Select
                            initialValue={timeStore.aggregationPeriod.toString()}
                            onChange={handleChange}
                            options={GRANULARITY_OPTIONS}
                            dropdownToggleClassname='granularity'
                        />
                    </div>
                    <Button
                        className='text-white d-flex align-items-center justify-content-between px-4 py-2 ms-3'
                        disabled={!timeStore.lastMs}
                        onClick={() => timeStore.refreshTimeRange()}
                        variant='primary'
                    >
                        <FontIcon
                            className='text-white m-2'
                            icon={IconNames.REFRESH}
                            size={15}
                        />
                        <span className='fs-6 bold-text'>REFRESH</span>
                    </Button>
                </>
            )}
        </div>
    );
};

GeneralSearchBar.propTypes = {
    shouldShowOnlySearchInput: PropTypes.bool,
    timeStore: PropTypes.object
};

export default setupComponent(GeneralSearchBar);
