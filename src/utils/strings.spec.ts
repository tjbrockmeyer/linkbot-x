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
            {input: 'today is Sam\'s Birthday', output: 'Sam'},
            {input: 'set today as George\'s bday please', output: 'George'},
            {input: 'set tomorrow as the BirthDay of Aang', output: 'Aang'},
            {input: 'set today as my birthday', output: 'self'},
            {input: 'set today as my birtHday', output: 'self'},
            {input: 'tomorrow is my bDay', output: 'self'},
        ].forEach(({input, output}) => it(`should find '${input}' as '${output}'`, () => {
            const result = findBirthdayOwnerInText(input);
            expect(result).equals(output);
        }));

        [
            'today is not my day',
            'what day is it today',
            'this should not match whatsoever',
            'this should have birthday, but no matches'
        ].forEach(input => it(`should not be able to find the owner in '${input}'`, () => {
            const result = findBirthdayOwnerInText(input);
            expect(result).is.null;
        }));
        
    });
});