import React, {useState} from 'react';
import PropTypes from 'prop-types';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import moment from 'moment';

import {formatDateTimeRange, last} from 'helpers/date-helper';
import FontIcon from './font-icon';
import {IconNames} from 'constants';

const GET_RANGE_DURATION = {
    'Last 5 minutes': () => moment.duration(5, 'minutes').valueOf(),
    'Last 15 minutes': () => moment.duration(15, 'minutes').valueOf(),
    'Last 1 hours': () => moment.duration(1, 'hours').valueOf(),
    'Last 3 hours': () => moment.duration(3, 'hours').valueOf(),
    'Last 6 hours': () => moment.duration(6, 'hours').valueOf(),
    'Last 24 hours': () => moment.duration(24, 'hours').valueOf(),
    'Last 2 days': () => moment.duration(2, 'days').valueOf(),
    'Last 7 days': () => moment.duration(7, 'days').valueOf(),
    'Last 30 days': () => moment.duration(30, 'days').valueOf(),
    'Last 60 days': () => moment.duration(60, 'days').valueOf()
};

const initialSettings = {
    ranges: {
        'Last 5 minutes': last(5, 'minutes'),
        'Last 15 minutes': last(15, 'minutes'),
        'Last 1 hours': last(1, 'hours'),
        'Last 3 hours': last(3, 'hours'),
        'Last 6 hours': last(6, 'hours'),
        'Last 24 hours': last(24, 'hours'),
        'Last 2 days': last(2, 'days'),
        'Last 7 days': last(7, 'days'),
        'Last 30 days': last(30, 'days'),
        'Last 60 days': last(60, 'days')
    },
    opens: 'left',
    timePicker: true,
    linkedCalendars: false,
    alwaysShowCalendars: true,
    showCustomRangeLabel: false,
    applyButtonClasses: 'btn-primary px-4 py-2 text-white m-2',
    cancelButtonClasses: 'btn-light px-4 py-2 text-secondary m-2'
};
const DateTimeRangePicker = ({onChange, start, end, classNames, datePickerSettings, width}) => {
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const handleChange = ({startDate, endDate, chosenLabel}) => {

        if (chosenLabel) {
            // Clicked a "lastXXXHours" type range.
            const getLastDurationMs = GET_RANGE_DURATION[chosenLabel];

            onChange({lastMs: getLastDurationMs()});
        } else {
            onChange({start: startDate, end: endDate});
        }
    };

    return (
        <div style={{width}}>
            <DateRangePicker
                initialSettings={{
                    startDate: start,
                    endDate: end,
                    ...initialSettings,
                    ...datePickerSettings
                }}
                onApply={(_, {startDate, endDate, chosenLabel}) => {
                    handleChange({startDate, endDate, chosenLabel});
                }}
                onCallback={(startDate, endDate, chosenLabel) => {
                    handleChange({startDate, endDate, chosenLabel});
                }}
                onHide={() => setIsCalendarVisible(false)}
                onShow={() => setIsCalendarVisible(true)}>

                <div className={`d-flex border border-secondary py-1 px-3 align-items-center rounded-3 ${classNames}`}>
                    <FontIcon className='text-secondary' icon={IconNames.DATE} size={25}/>
                    <span className='text-secondary py-2 px-4 fs-5'>
                        {formatDateTimeRange(start, end)}</span>
                    <FontIcon className='text-secondary' icon={isCalendarVisible ? IconNames.ARROW_UP : IconNames.ARROW_DOWN} size={10}/>
                </div>
            </DateRangePicker>
        </div>
    );
};

DateTimeRangePicker.defaultProps = {
    classNames: '',
    datePickerSettings: {},
    width: 'auto'
};

DateTimeRangePicker.propTypes = {
    classNames: PropTypes.string,
    datePickerSettings: PropTypes.object,
    end: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    start: PropTypes.object,
    width: PropTypes.string
};

export default DateTimeRangePicker;
