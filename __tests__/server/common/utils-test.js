import {unionMerge, normalize} from '../../../src/server/common/utils.mjs';

describe('utils', () => {
    describe('unionMerge', () => {
        test('create union and aggregate values by record key, assume missing values to be 0', () => {
            const array1 = [{ key: 'a', value: 1}, {key: 'b', value: 2}, {key: 'd', value: 4}];
            const array2 = [{ key: 'a', value: 11}, {key: 'b', value: 12}, {key: 'c', value: 13}];

            const actual = unionMerge(array1, array2).sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);

            const expected = [{key: 'a', values:[1, 11]}, {key: 'b', values: [2, 12]}, {key: 'c', values: [0, 13]}, {key: 'd', values: [4, 0]}];
            
            expect(expected).toEqual(actual);
        });
    });
});
