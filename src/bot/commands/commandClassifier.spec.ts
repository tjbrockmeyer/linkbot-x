import { expect } from 'chai';
import {classify} from './commandClassifier';
import {setBirthday} from './birthday/setBirthday';
import {showBirthday} from './birthday/showBirthday';
import {lookupLeagueOfLegends} from './leagueOfLegends/lookupLeagueGame';

describe('bot commands commandClassifier', () => {

    describe('classify', () => {
        
        [
            {
                command: setBirthday,
                set: [
                    'set my birthday',
                    'register a birthday',
                    'can you set my birthday to today',
                    'register my birthday as tomorrow'
                ]
            },
            {
                command: showBirthday,
                set: [
                    'show the birthdays',
                    'what birthdays are known',
                    'show my birthday',
                    'what are everyones birthdays'
                ]
            },
            {
                command: lookupLeagueOfLegends,
                set: [
                    'look up my league game',
                    'show me my league game',
                    'look up league of legends',
                    'pull up our league game'
                ]
            },
        ].forEach(({command, set}) => set.forEach(phrase => it(`should classify '${phrase}' as '${command.name}'`, () => {
            const result = classify(phrase);
            expect(result.status, JSON.stringify(result.classifications, null, 2)).equals('success');
            expect(result.command).equals(command);
        })));
    
        [].forEach(phrase => it(`should find multiple results for '${phrase}'`, () => {
            const result = classify(phrase);
            expect(result.status, JSON.stringify(result.classifications, null, 2)).equals('multiple results');
        }));
    
        [
            'lol',
            'hows it going',
            'give me a sign'
        ].forEach(phrase => it(`should no results for '${phrase}'`, () => {
            const result = classify(phrase);
            expect(result.status, JSON.stringify(result.classifications, null, 2)).equals('no results');
        }));
    });
});