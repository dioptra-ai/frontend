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

