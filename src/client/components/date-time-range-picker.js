import React, {useState} from 'react';
import PropTypes from 'prop-types';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import moment from 'moment';
import {IoCalendarOutline, IoChevronDownSharp, IoChevronUpSharp} from 'react-icons/io5';
import {Button, Overlay, Tooltip} from 'react-bootstrap';

import {formatDateTimeRange, last} from 'helpers/date-helper';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import useAllFilters from 'hooks/use-all-filters';
import metricsClient from 'clients/metrics';
import {setupComponent} from 'helpers/component-helper';
import Async from 'components/async';

const GET_RANGE_DURATION = {
    'Last 5 minutes': () => moment.duration(5, 'minutes').valueOf(),
    'Last 1 hours': () => moment.duration(1, 'hours').valueOf(),
    'Last 3 hours': () => moment.duration(3, 'hours').valueOf(),
    'Last 6 hours': () => moment.duration(6, 'hours').valueOf(),
    'Last 24 hours': () => moment.duration(24, 'hours').valueOf(),
    'Last 2 days': () => moment.duration(2, 'days').valueOf(),
    'Last 7 days': () => moment.duration(7, 'days').valueOf(),
    'Last 30 days': () => moment.duration(30, 'days').valueOf(),
    'Last 90 days': () => moment.duration(90, 'days').valueOf()
};

const initialSettings = {
    ranges: {
        'Last 5 minutes': last(5, 'minutes'),
        'Last 1 hours': last(1, 'hours'),
        'Last 6 hours': last(6, 'hours'),
        'Last 24 hours': last(24, 'hours'),
        'Last 2 days': last(2, 'days'),
        'Last 7 days': last(7, 'days'),
        'Last 30 days': last(30, 'days'),
        'Last 90 days': last(90, 'days')
    },
    opens: 'left',
    timePicker: true,
    linkedCalendars: false,
    alwaysShowCalendars: true,
    showCustomRangeLabel: false,
    applyButtonClasses: 'btn-primary px-4 py-2 text-white m-2',
    cancelButtonClasses: 'btn-light px-4 py-2 text-secondary m-2'
};
const DateTimeRangePicker = ({onChange, start, end, className, datePickerSettings, width, timeStore, jumpToLatestDataPopup}) => {
    const overlayTarget = React.useRef(null);
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const allFilters = useAllFilters();
    const allSqlFiltersWithoutTime = useAllSqlFilters({excludeCurrentTimeFilters: true});
    const handleChange = ({startDate, endDate, chosenLabel}) => {
        if (chosenLabel) {
            // Clicked a "lastXXXHours" type range.
            const getLastDurationMs = GET_RANGE_DURATION[chosenLabel];

            onChange({lastMs: getLastDurationMs()});
        } else {
            onChange({start: startDate, end: endDate});
        }
        setIsCalendarVisible(false);
    };

    return (
        <>
            {
                jumpToLatestDataPopup ? (
                    <Async
                        spinner={false}
                        fetchData={() => metricsClient('throughput', {filters: allFilters})}
                        refetchOnChanged={[JSON.stringify(allFilters)]}
                        renderData={([d]) => (
                            <Overlay target={overlayTarget.current} placement='bottom-end' show={d?.value === 0}>
                                {(props) => (
                                    <Tooltip className='text-center' {...props}>
                                        No data could be found within the selected time range.
                                        <Button className='btn-primary text-white m-2' onClick={async () => {
                                            const [d] = await metricsClient('default-time-range', {
                                                sql_filters: allSqlFiltersWithoutTime
                                            }, false);

                                            if (d) {
                                                timeStore.setTimeRange(d);
                                            } else {
                                                alert('Sorry, we could not find any data. Please see the documentation for information about sending data into Dioptra.');
                                            }
                                        }}>
                                            Go to Latest Data
                                        </Button>
                                    </Tooltip>
                                )}
                            </Overlay>
                        )}
                    />

                ) : null
            }
            <div ref={overlayTarget} style={{
                width,
                minWidth: 300
            }} className='cursor-pointer'>
                <DateRangePicker
                    initialSettings={{
                        startDate: start,
                        endDate: end,
                        ...initialSettings,
                        ...datePickerSettings
                    }}
                    key={JSON.stringify({start, end})}
                    onCallback={(startDate, endDate, chosenLabel) => {
                        handleChange({startDate, endDate, chosenLabel});
                    }}
                    onHide={() => setIsCalendarVisible(false)}
                    onShow={() => setIsCalendarVisible(true)}>

                    <div className={`d-flex border py-0 px-3 align-items-center justify-content-between rounded-3 ${className}`}>
                        <IoCalendarOutline className='text-secondary fs-4 flex-shrink-0'/>
                        <div className='d-flex align-items-center'>
                            <div className='text-secondary py-2 px-4 fs-6'>{
                                formatDateTimeRange(start, end)
                            }</div>
                            {isCalendarVisible ? (
                                <IoChevronUpSharp className='fs-4 flex-shrink-0'/>
                            ) : (
                                <IoChevronDownSharp className='fs-4 flex-shrink-0'/>
                            )}
                        </div>
                    </div>
                </DateRangePicker>
            </div>
        </>
    );
};

DateTimeRangePicker.defaultProps = {
    className: '',
    datePickerSettings: {},
    width: 'auto'
};

DateTimeRangePicker.propTypes = {
    className: PropTypes.string,
    datePickerSettings: PropTypes.object,
    end: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    start: PropTypes.object,
    width: PropTypes.string,
    timeStore: PropTypes.object.isRequired,
    jumpToLatestDataPopup: PropTypes.bool
};

export default setupComponent(DateTimeRangePicker);
