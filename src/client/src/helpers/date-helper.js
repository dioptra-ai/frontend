import moment from 'moment';
import {isMoment} from './type-helper';

const DATE_FORMAT = 'MM/DD/YYYY';
const TIME_FORMAT = 'HH:mm A';
const DATE_TIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`;

const last = (amount, periodName) => [moment(), moment().subtract(amount, periodName)];

export const formatDate = (momentDate) => isMoment(momentDate) ? momentDate.format(DATE_FORMAT) : '';
export const formatTime = (momentDate) => isMoment(momentDate) ? momentDate.format(TIME_FORMAT) : '';
export const formatDateTime = (momentDate) => isMoment(momentDate) ? momentDate.format(DATE_TIME_FORMAT) : '';
export const formatDateRange = (momentDateFrom, momentDateTo) => isMoment(momentDateFrom) && isMoment(momentDateTo) ?
    `${formatDate(momentDateFrom)} - ${formatDate(momentDateTo)}` :
    '';
export const formatDateTimeRange = (momentDateFrom, momentDateTo) => isMoment(momentDateFrom) && isMoment(momentDateTo) ?
    `${formatDateTime(momentDateFrom)} - ${formatDateTime(momentDateTo)}` :
    '';

export const lastDays = (days) => last(days, 'days');
export const lastHours = (hours) => last(hours, 'hours');
export const lastMinutes = (minutes) => last(minutes, 'minutes');

