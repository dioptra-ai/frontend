import {
    formatDate,
    formatDateRange,
    formatDateTime,
    formatDateTimeRange,
    formatTime,
    lastDays,
    lastHours,
    lastMinutes
} from '../../../src/client/src/helpers/date-helper';
import moment from 'moment';
import {assertEmptyString} from '../_utils';

/*eslint-disable no-undef*/
describe('date-helper', () => {
    describe('formatDate', () => {
        test('should return empty string if non moment instance', () => {
            expect(formatDate()).toEqual('');
            assertEmptyString(formatDate(null));
            assertEmptyString(formatDate(1));
            assertEmptyString(formatDate(''));
            assertEmptyString(formatDate('1234'));
            assertEmptyString(formatDate([]));
            assertEmptyString(formatDate({}));
        });
        test('should return only date part formatted if valid moment object given', () => {
            expect(formatDate(moment('2020-01-31'))).toEqual('01/31/2020');
            expect(formatDate(moment('2020-03-21'))).toEqual('03/21/2020');
            expect(formatDate(moment('2020-04-11'))).toEqual('04/11/2020');
        });
    });
    describe('formatTime', () => {
        test('should return empty string if non moment instance', () => {
            assertEmptyString(formatTime());
            assertEmptyString(formatTime(null));
            assertEmptyString(formatTime(1));
            assertEmptyString(formatTime(''));
            assertEmptyString(formatTime('1234'));
            assertEmptyString(formatTime([]));
            assertEmptyString(formatTime({}));
        });
        test('should return only time part formatted if valid moment object given', () => {
            expect(formatTime(moment('2020-01-31 11:00'))).toEqual('11:00');
            expect(formatTime(moment('2020-03-21 12:12'))).toEqual('12:12');
            expect(formatTime(moment('2020-04-11 13:45'))).toEqual('13:45');
        });
    });
    describe('formatDateTime', () => {
        test('should return empty string if non moment instance', () => {
            assertEmptyString(formatDateTime());
            assertEmptyString(formatDateTime(null));
            assertEmptyString(formatDateTime(1));
            assertEmptyString(formatDateTime(''));
            assertEmptyString(formatDateTime('1234'));
            assertEmptyString(formatDateTime([]));
            assertEmptyString(formatDateTime({}));
        });
        test('should return full date-time formatted if valid moment object given', () => {
            expect(formatDateTime(moment('2020-01-31 11:00'))).toEqual('01/31/2020 11:00');
            expect(formatDateTime(moment('2020-03-21 12:12'))).toEqual('03/21/2020 12:12');
            expect(formatDateTime(moment('2020-04-11 13:45'))).toEqual('04/11/2020 13:45');
        });
    });
    describe('formatDateRange', () => {
        test('should return empty string if non moment instance', () => {
            assertEmptyString(formatDateRange());
            assertEmptyString(formatDateRange(null));
            assertEmptyString(formatDateRange(1));
            assertEmptyString(formatDateRange(''));
            assertEmptyString(formatDateRange('1234'));
            assertEmptyString(formatDateRange([]));
            assertEmptyString(formatDateRange({}));
        });
        test('should return date range formatted if valid moment object given', () => {
            expect(formatDateRange(moment('2020-01-31 11:00'), moment('2020-04-11 13:45'))).toEqual('01/31/2020 - 04/11/2020');
        });
    });
    describe('formatDateTimeRange', () => {
        test('should return empty string if non moment instance', () => {
            assertEmptyString(formatDateTimeRange());
            assertEmptyString(formatDateTimeRange(null));
            assertEmptyString(formatDateTimeRange(1));
            assertEmptyString(formatDateTimeRange(''));
            assertEmptyString(formatDateTimeRange('1234'));
            assertEmptyString(formatDateTimeRange([], null));
            assertEmptyString(formatDateTimeRange({}, moment()));
        });
        test('should return full date-time range formatted if valid moment object given', () => {
            expect(formatDateTimeRange(moment('2020-01-31 11:00'), moment('2020-04-11 13:45'))).toEqual('01/31/2020 11:00 - 04/11/2020 13:45');
        });
    });
    describe('lastDays', () => {
        test('should return an array where the difference between the first and the second date is passed amount of days', () => {
            const days = 5;
            const [first, second] = lastDays(days);

            expect(first.diff(second, 'days')).toEqual(days);
        });
    });
    describe('lastHours', () => {
        test('should return an array where the difference between the first and the second date is passed amount of hours', () => {
            const hours = 5;
            const [first, second] = lastHours(hours);

            expect(first.diff(second, 'hours')).toEqual(hours);
        });
    });
    describe('lastMinutes', () => {
        test('should return an array where the difference between the first and the second date is passed amount of minutes', () => {
            const minutes = 5;
            const [first, second] = lastMinutes(minutes);

            expect(first.diff(second, 'minutes')).toEqual(minutes);
        });
    });
});
