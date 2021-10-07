import { expect } from "chai"

import {joinWithAnd, findBirthdayOwnerInText} from '../../src/utils/strings';


describe('utils strings', () => {
    
    describe('joinWithAnd', () => {
        [
            {input: [], output: ''},
            {input: ['abc'], output: 'abc'},
            {input: ['abc', '123'], output: 'abc and 123'},
            {input: ['abc', '123', 'xyz'], output: 'abc, 123, and xyz'},
            {input: ['abc', '123', 'xyz', '789'], output: 'abc, 123, xyz, and 789'},
        ].forEach(({input, output}) => it(`should format ${JSON.stringify(input)} as '${output}'`, () => {
            const result = joinWithAnd(input);
            expect(result).equals(output);
        }));
    });
    
    describe('findBirthdayOwnerInText', () => {
        [
            {input: 'Larry\'s birthday', output: 'Larry'},
            {input: 'today is Sam\'s birthday', output: 'Sam'},
            {input: 'set today as George\'s birthday please', output: 'George'},
            {input: 'set tomorrow as the birthday of Aang', output: 'Aang'},
        ].forEach(({input, output}) => it(`should find '${input}' as '${output}'`, () => {
            const result = findBirthdayOwnerInText(input);
            expect(result).equals(output);
        }));
    });
});