import {isMoment} from '../../../src/client/src/helpers/type-helper';
import moment from 'moment';

describe('type-helper', () => {
    describe('isMoment', () => {
        test('should return false for non moment values', () => {
            expect(isMoment()).toEqual(false);
            expect(isMoment(null)).toEqual(false);
            expect(isMoment({})).toEqual(false);
            expect(isMoment([])).toEqual(false);
            expect(isMoment('')).toEqual(false);
            expect(isMoment('03/03/2020')).toEqual(false);
        });
        test('should return true for moment object', () => {
            expect(isMoment(moment())).toEqual(true);
            expect(isMoment(moment().subtract(2, 'days'))).toEqual(true);
            expect(isMoment(moment().add(2, 'years'))).toEqual(true);
        });
    });
});
