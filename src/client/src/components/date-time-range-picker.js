import React, {useState} from 'react';
import PropTypes from 'prop-types';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import {formatDateTimeRange, lastDays, lastHours, lastMinutes} from '../helpers/date-helper';
import FontIcon from './font-icon';
import {IconNames} from '../constants';
import {isMoment} from '../helpers/type-helper';

const initialSettings = {
    ranges: {
        'Last 5 minutes': lastMinutes(5),
        'Last 15 minutes': lastMinutes(15),
        'Last 1 hours': lastHours(1),
        'Last 3 hours': lastHours(3),
        'Last 6 hours': lastHours(6),
        'Last 24 hours': lastHours(24),
        'Last 2 days': lastDays(2),
        'Last 7 days': lastDays(7),
        'Last 30 days': lastDays(30)
    },
    opens: 'left',
    timePicker: true,
    linkedCalendars: false,
    alwaysShowCalendars: true,
    showCustomRangeLabel: false,
    applyButtonClasses: 'btn-primary px-4 py-2 text-white m-2',
    cancelButtonClasses: 'btn-light px-4 py-2 text-secondary m-2'
};
const DateTimeRangePicker = ({onChange, start, end}) => {
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);

    const handleChange = (newStart, newEnd) => {
        if (newStart !== null && newEnd !== null && isMoment(newStart) && isMoment(newEnd)) {
            onChange?.({start: newStart, end: newEnd});
        }
    };

    return (
        <div>
            <DateRangePicker initialSettings={{
                startDate: start,
                endDate: end,
                ...initialSettings
            }}
            onCallback={handleChange}
            onHide={() => setIsCalendarVisible(false)}
            onShow={() => setIsCalendarVisible(true)}>

                <div className='d-flex border border-secondary py-1 px-3 align-items-center rounded-3'>
                    <FontIcon className='text-secondary' icon={IconNames.DATE} size={25}/>
                    <span className='text-secondary py-2 px-4 fs-5'>
                        {formatDateTimeRange(start, end)}</span>
                    <FontIcon className='text-secondary' icon={isCalendarVisible ? IconNames.ARROW_UP : IconNames.ARROW_DOWN} size={10}/>
                </div>
            </DateRangePicker>
        </div>
    );
};

DateTimeRangePicker.propTypes = {
    end: PropTypes.object,
    onChange: PropTypes.func,
    start: PropTypes.object
};

export default DateTimeRangePicker;
