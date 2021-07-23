import moment from 'moment';

const last = (amount, periodName) => {
    const end = moment();
    const start = end.clone().subtract(amount, periodName);

    return [start, end];
};

export const formatDate = (m) => moment(m).toDate().toLocaleDateString();
export const formatTime = (m) => moment(m).toDate().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
export const formatDateTime = (m) => `${formatDate(m)} ${formatTime(m)}`;
export const formatDateRange = (momentDateFrom, momentDateTo) => `${formatDate(momentDateFrom)} - ${formatDate(momentDateTo)}`;
export const formatDateTimeRange = (momentDateFrom, momentDateTo) => `${formatDateTime(momentDateFrom)} - ${formatDateTime(momentDateTo)}`;

export const lastSeconds = (seconds) => last(seconds, 'seconds');
export const lastDays = (days) => last(days, 'days');
export const lastHours = (hours) => last(hours, 'hours');
export const lastMinutes = (minutes) => last(minutes, 'minutes');

