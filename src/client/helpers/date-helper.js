import moment from 'moment';

export const last = (amount, periodName) => {
    const start = moment().subtract(amount, periodName);

    return [start, undefined];
};

export const formatDate = (m) => moment(m).toDate().toLocaleDateString();
export const formatTime = (m) => moment(m).toDate().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
export const formatDateTime = (m, granularityMs) => {

    if (granularityMs > 24 * 60 * 60 * 1000) {

        return formatDate(m);
    } else {

        return `${formatDate(m)} ${formatTime(m)}`;
    }
};
export const formatDateRange = (momentDateFrom, momentDateTo) => `${formatDate(momentDateFrom)} - ${formatDate(momentDateTo)}`;
export const formatDateTimeRange = (momentDateFrom, momentDateTo) => `${formatDateTime(momentDateFrom)} - ${formatDateTime(momentDateTo)}`;

export const lastMilliseconds = (ms) => last(ms, 'milliseconds');
export const lastDays = (days) => last(days, 'days');
export const lastHours = (hours) => last(hours, 'hours');
export const lastMinutes = (minutes) => last(minutes, 'minutes');

const SQL_OUTER_LIMIT = 100;

const granularityLadderMs = [
    moment.duration(1, 'second'),
    moment.duration(10, 'second'),
    moment.duration(1, 'minute'),
    moment.duration(10, 'minute'),
    moment.duration(1, 'hour'),
    moment.duration(3, 'hour'),
    moment.duration(6, 'hour'),
    moment.duration(1, 'day'),
    moment.duration(5, 'day'),
    moment.duration(30, 'day')
];

export const timeRangeGranularity = (start, end, maxTicks = SQL_OUTER_LIMIT) => {
    const rangeSeconds = moment(end).diff(moment(start)) / 1000;
    const DURATION_MAX_SEC_TO_GRANULARITY = granularityLadderMs.map((duration) => {
        return {
            maxSpanSec: maxTicks * duration.asSeconds(),
            granularity: duration
        };
    });

    for (const {maxSpanSec, granularity} of DURATION_MAX_SEC_TO_GRANULARITY) {
        if (rangeSeconds < maxSpanSec) {
            return granularity;
        }
    }

    return moment.duration(1, 'month');
};
