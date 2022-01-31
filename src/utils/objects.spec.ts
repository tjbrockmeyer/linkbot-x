import { expect } from "chai"
import {removeUndefinedKeys} from './objects';

describe('utils objects', () => {

    describe('removeUndefinedKeys', () => {

        [
            {obj: {a: undefined, b: 2, c: 3}, expected: {b: 2, c: 3}},
        ].forEach(({obj, expected}) => it(`should remove undefined keys without touching other keys`, () => {
            const output = removeUndefinedKeys(obj);
            expect(output).not.deep.equals(obj);
            expect(output).deep.equals(expected);
        }));
    })
})