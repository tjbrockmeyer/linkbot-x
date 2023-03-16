import { expect } from "chai"
import { findDateInText } from './dates';

describe('utils date', () => {

    describe('findDateInText', () => {
        [
            {text: 'set my birthday to 9/2/94', date: new Date(1994, 8, 2)},
            {text: '05/30/40', date: new Date(2040, 4, 30)},
            {text: '05-30-1999', date: new Date(1999, 4, 30)},
            {text: 'my birthday is on 12/01/2020', date: new Date(2020, 11, 1)},
            {text: 'is today my birthday?', date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())},
            {text: 'tomorrow must be your birthday', date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1)},
            {text: 'register my birthday as yesterday', date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1)},
        ].forEach(({text, date}) => it(`should parse '${text}' to '${date}'`, () => {
            const result = findDateInText(text);
            expect(result).deep.equals(date);
        }))
    })
})