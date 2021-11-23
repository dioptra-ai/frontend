import React, {useEffect, useState} from 'react';
import {IconNames} from 'constants';
import {Button, Card, Form, InputGroup} from 'react-bootstrap';
import PropTypes from 'prop-types';

import FontIcon from 'components/font-icon';
import DateTimeRangePicker from 'components/date-time-range-picker';
import TextInput from 'components/text-input';
import {setupComponent} from 'helpers/component-helper';
import baseJsonClient from 'clients/base-json-client';
import {HiClock} from 'react-icons/hi';
import moment from 'moment';
import useOutsideClick from 'customHooks/useOutsideClick';

const INITIAL_GRANULARITY_STATE = {
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0
};

const GeneralSearchBar = ({shouldShowOnlySearchInput, timeStore}) => {
    const [searchString, setSearchString] = useState('');
    const [results, setResults] = useState([]);
    const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
    const [granularityData, setGranularityData] = useState(INITIAL_GRANULARITY_STATE);

    const {ref, isComponentVisible, setIsComponentVisible} = useOutsideClick(false);

    const timeDuration =
        moment.duration(granularityData.months, 'months').asSeconds() +
        moment.duration(granularityData.days, 'days').asSeconds() +
        moment.duration(granularityData.hours, 'hours').asSeconds() +
        moment.duration(granularityData.minutes, 'minutes').asSeconds();

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

    const handleChange = ({target}) => setGranularityData({...granularityData, [target?.name]: target?.value});

    const handleSubmit = (e) => {
        e.preventDefault();
        timeStore.aggregationPeriod = timeDuration;
        setIsComponentVisible(false);
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
                    <div style={{position: 'relative'}} ref={ref}>
                        <Button
                            className='text-white d-flex align-items-center justify-content-between px-4 py-1 ms-3'
                            onClick={() => setIsComponentVisible(true)}
                            variant='primary'
                        >
                            <HiClock className='text-white m-2' size={22}/>
                            <span className='fs-6 bold-text'>Granularity</span>
                        </Button>
                        {isComponentVisible ? (
                            <Card className='granularity mt-2'>
                                <Form autoComplete='off' className='w-100' onSubmit={handleSubmit}>
                                    <Card.Body className='d-flex justify-content-between'>
                                        <Form.Group className='mb-3'>
                                            <Form.Label>Month</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    className={
                                                        'bg-light text-secondary input'
                                                    }
                                                    name='months'
                                                    onChange={handleChange}
                                                    required
                                                    type='number'
                                                    value={granularityData.months}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                        <Form.Group className='mb-3'>
                                            <Form.Label>Days</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    className={
                                                        'bg-light text-secondary input'
                                                    }
                                                    name='days'
                                                    onChange={handleChange}
                                                    required
                                                    type='number'
                                                    value={granularityData.days}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                        <Form.Group className='mb-3'>
                                            <Form.Label>Hours</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    className={
                                                        'bg-light text-secondary input'
                                                    }
                                                    name='hours'
                                                    onChange={handleChange}
                                                    required
                                                    type='number'
                                                    value={granularityData.hours}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                        <Form.Group className='mb-3'>
                                            <Form.Label>Minutes</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    className={
                                                        'bg-light text-secondary input'
                                                    }
                                                    name='minutes'
                                                    onChange={handleChange}
                                                    required
                                                    type='number'
                                                    value={granularityData.minutes}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    </Card.Body>
                                    <Card.Title className='px-3 pb-3'>
                                        Aggregation Period: {timeDuration} secs
                                    </Card.Title>
                                    <Card.Footer className='d-flex justify-content-end'>
                                        <Button
                                            className='bg-dark text-white border-0 bold-text fs-7 px-3'
                                            type='submit'
                                            style={{marginRight: '2rem'}}
                                        >
                                            Apply
                                        </Button>
                                        <Button className='text-white border-0 bold-text fs-7 px-3' onClick={() => {
                                            setIsComponentVisible(false);
                                            timeStore.aggregationPeriod = null;
                                            setGranularityData(INITIAL_GRANULARITY_STATE);
                                        }}>
                                            Cancel
                                        </Button>
                                    </Card.Footer>
                                </Form>
                            </Card>
                        ) : null}
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
