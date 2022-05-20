import React, {useEffect, useState} from 'react';
import {Button} from 'react-bootstrap';
import PropTypes from 'prop-types';
import {IoRefreshSharp, IoSearchOutline} from 'react-icons/io5';
import {BsCart4} from 'react-icons/bs';
import {Link} from 'react-router-dom';

import DateTimeRangePicker from 'components/date-time-range-picker';
import TextInput from 'components/text-input';
import {setupComponent} from 'helpers/component-helper';
import baseJsonClient from 'clients/base-json-client';

const GeneralSearchBar = ({shouldShowOnlySearchInput, timeStore, userStore}) => {
    const [searchString, setSearchString] = useState('');
    const [results, setResults] = useState([]);
    const [selectedResultIndex, setSelectedResultIndex] = useState(-1);

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
        const nameMatch = name?.replace(
            new RegExp(searchString, 'gi'),
            (match) => match.bold()
        );
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

    return (
        <div className='py-2 px-3 d-flex align-items-center border-bottom'>
            <IoSearchOutline className='fs-3'/>
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
                    <Button
                        className='d-flex align-items-center justify-content-between px-2 py-2 ms-1 me-3 btn-secondary'
                        disabled={!timeStore.lastMs}
                        onClick={() => timeStore.refreshTimeRange()}
                        variant='primary'
                    >
                        <IoRefreshSharp className='fs-4 text-dark'/>
                    </Button>
                </>
            )}
            <div className='position-relative click-down'>
                {
                    userStore.userData.cart.length ? (
                        <div className='position-absolute fs-5 w-100 text-center text-dark' style={{top: -16}}>
                            {userStore.userData.cart.length}
                        </div>
                    ) : null
                }
                <Link to='/cart'>
                    <BsCart4 className='fs-3 text-dark'/>
                </Link>
            </div>
        </div>
    );
};

GeneralSearchBar.propTypes = {
    shouldShowOnlySearchInput: PropTypes.bool,
    timeStore: PropTypes.object,
    userStore: PropTypes.object
};

export default setupComponent(GeneralSearchBar);
