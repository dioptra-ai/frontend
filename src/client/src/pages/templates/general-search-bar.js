import React, {useEffect, useState} from 'react';
import {IconNames} from 'constants';
import {Button} from 'react-bootstrap';
import PropTypes from 'prop-types';

import FontIcon from 'components/font-icon';
import DateTimeRangePicker from 'components/date-time-range-picker';
import TextInput from 'components/text-input';
import {setupComponent} from 'helpers/component-helper';
import baseJsonClient from 'clients/base-json-client';

const GeneralSearchBar = ({shouldShowOnlySearchInput, timeStore}) => {
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
    return `<p>${name?.replace(
      new RegExp(searchString, 'gi'),
      (match) => `<b>${match}</b>`
    )}
            </p>
            <p>${description?.replace(
              new RegExp(searchString, 'gi'),
              (match) => `<b>${match}</b>`
            )}
            </p>
            <p>
                <span>ID: </span>
                ${mlModelId?.replace(
                  new RegExp(searchString, 'gi'),
                  (match) => `<b>${match}</b>`
                )}
                <span>Type: </span>
                ${mlModelType?.replace(
                  new RegExp(searchString, 'gi'),
                  (match) => `<b>${match}</b>`
                )}
            </p>`;
  };

  return (
    <div className="py-3 px-4 d-flex align-items-center border-bottom">
      <FontIcon className="text-secondary" icon={IconNames.SEARCH} size={25} />
      <div className="flex-grow-1 mx-3 general-search-bar">
        <TextInput
          className="form-control border-0 py-2 search-input font-weight-bold"
          placeholder="Search"
          value={searchString}
          onChange={setSearchString}
          onKeyDown={handleKeyDown}
        />
        <ul className="results bg-white text-dark">
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
            className="text-white d-flex align-items-center justify-content-between px-4 py-2 ms-3"
            disabled={!timeStore.lastMs}
            onClick={() => timeStore.refreshTimeRange()}
            variant="primary"
          >
            <FontIcon
              className="text-white m-2"
              icon={IconNames.REFRESH}
              size={15}
            />
            <span className="fs-6 bold-text">REFRESH</span>
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
