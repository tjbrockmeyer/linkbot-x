import { expect } from 'chai';
import { fuzzySearch } from './../../src/utils/search';


describe('utils search', () => {
    
    describe('fuzzySearch', () => {

        const items = [
            'hat',
            'shirt',
            'glove',
            'bat',
            'ball',
            'apple',
            'orange',
            'banana',
        ];

        [
            {input: 'hat', output: 'hat'},
            {input: 'that', output: 'hat'},
            {input: 'aple', output: 'apple'},
            {input: 'bana', output: 'banana'},
            {input: 'oranges', output: 'orange'},
            {input: 'bal', output: 'ball'},
        ].forEach(({input, output}) => it(`should only find '${output}' when searching for '${input}'`, () => {
            const result = fuzzySearch(input, items, items);
            expect(result.length, JSON.stringify(result, null, 2)).equals(1);
            expect(result[0].result).equals(output);
        }));

        [
            'h',
            'abcd',
            'wasd',
            'word',
            'whatup'
        ].forEach(input => it(`should not find any results when searching for '${input}'`, () => {
            const result = fuzzySearch(input, items, items);
            expect(result, JSON.stringify(result, null, 2)).is.empty;
        }));

        [
            'bal'
        ].forEach(input => it(`should find multiple results when searching for '${input}' with a low minimum match value`, () => {
            const result = fuzzySearch(input, items, items, 0.7);
            expect(result.length, JSON.stringify(result, null, 2)).greaterThan(1);
            expect(result.map(r => r.result)).includes('bat');
            expect(result.map(r => r.result)).includes('ball');
        }));
    });
});