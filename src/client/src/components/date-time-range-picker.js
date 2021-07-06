import React, {useCallback, useState} from 'react';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import {formatDateTimeRange, lastDays, lastHours, lastMinutes} from '../helpers/date-helper';
import FontIcon from './font-icon';
import {IconNames} from '../constants';
import {isMoment} from '../helpers/type-helper';

const initialSettings = {
    ranges: {
        'Last 5 minutes': lastMinutes(5),
        'Last 15 minutes': lastMinutes(15),
        'Last 30 minutes': lastMinutes(30),
        'Last 45 minutes': lastMinutes(45),
        'Last 1 hours': lastHours(1),
        'Last 3 hours': lastHours(3),
        'Last 6 hours': lastHours(6),
        'Last 12 hours': lastHours(12),
        'Last 24 hours': lastHours(24),
        'Last 2 days': lastDays(2)
    },
    opens: 'left',
    timePicker: true,
    linkedCalendars: false,
    alwaysShowCalendars: true,
    showCustomRangeLabel: false,
    applyButtonClasses: 'btn-primary px-4 py-2 text-white m-2',
    cancelButtonClasses: 'btn-light px-4 py-2 text-secondary m-2'
};
const DateTimeRangePicker = () => {
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const shouldDisplayDates = start !== null && end !== null;

    const handleChange = useCallback((newStart, newEnd) => {
        if (newStart !== null && newEnd !== null && isMoment(newStart) && isMoment(newEnd)) {
            setStart(newStart);
            setEnd(newEnd);
        }
    }, []);

    return (
        <div>
            <DateRangePicker initialSettings={initialSettings}
                onCallback={handleChange}
                onHide={() => setIsCalendarVisible(false)}
                onShow={() => setIsCalendarVisible(true)}>

                <div className='d-flex border border-secondary py-2 px-3 align-items-center rounded-3'>
                    <FontIcon className='text-secondary' icon={IconNames.DATE} size={25}/>
                    <span className='text-secondary py-2 px-4'>
                        { `${shouldDisplayDates ? formatDateTimeRange(start, end) : 'Select date/time period'}`} </span>
                    <FontIcon className='text-secondary' icon={isCalendarVisible ? IconNames.ARROW_UP : IconNames.ARROW_DOWN} size={10}/>
                </div>
            </DateRangePicker>
        </div>
    );
};

export default DateTimeRangePicker;
