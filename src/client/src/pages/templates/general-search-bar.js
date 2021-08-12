import React, {useEffect, useMemo, useState} from 'react';
import {IconNames} from 'constants';
import {Button} from 'react-bootstrap';
import PropTypes from 'prop-types';
import moment from 'moment';
import {withRouter} from 'react-router-dom';
import qs from 'qs';

import FontIcon from 'components/font-icon';
import DateTimeRangePicker from 'components/date-time-range-picker';
import TextInput from 'components/text-input';
import {setupComponent} from 'helpers/component-helper';

const GeneralSearchBar = ({
    shouldShowOnlySearchInput,
    timeStore,
    location,
    history
}) => {
    const {startMoment, endMoment} = timeStore;

    const [moments, setMoments] = useState({
        startStateMoment: startMoment,
        endStateMoment: endMoment
    });

    const {startTime, endTime, ...restQueryString} = useMemo(
        () => qs.parse(location?.search, {ignoreQueryPrefix: true}),
        [location?.search]
    );

    const startTimeMoment = useMemo(
        () => (startTime && moment(startTime).isValid() ? moment(startTime) : false),
        [startTime]
    );
    const endTimeMoment = useMemo(
        () => (endTime && moment(endTime).isValid() ? moment(endTime) : false),
        [endTime]
    );

    const handleDateChange = ({start, end}) => {
        timeStore.setTimeRange({start, end});
        setMoments({startStateMoment: start, endStateMoment: end});
    };

    useEffect(() => {
        if (startTimeMoment && endTimeMoment) handleDateChange({start: startTimeMoment, end: endTimeMoment});
    }, []);

    useEffect(() => {
        const {startStateMoment, endStateMoment} = moments;

        history.replace({
            pathname: location.pathname,
            search: qs.stringify({
                ...restQueryString,
                startTime: startStateMoment.toISOString(),
                endTime: endStateMoment.toISOString()
            })
        });
    }, [moments]);

    return (
        <div className='py-3 px-4 d-flex align-items-center border-bottom'>
            <FontIcon className='text-secondary' icon={IconNames.SEARCH} size={25} />
            <div className='flex-grow-1 mx-3'>
                <TextInput
                    className='form-control border-0 py-3 fs-5'
                    placeholder='Search'
                />
            </div>
            {shouldShowOnlySearchInput ? null : (
                <>
                    <DateTimeRangePicker
                        end={moments.endStateMoment}
                        onChange={handleDateChange}
                        start={moments.startStateMoment}
                    />
                    <Button
                        className='text-white d-flex align-items-center justify-content-between px-4 py-2 ms-3'
                        disabled={!timeStore.refreshable}
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
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    shouldShowOnlySearchInput: PropTypes.bool,
    timeStore: PropTypes.object
};

export default setupComponent(withRouter(GeneralSearchBar));
