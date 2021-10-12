
import { expect } from 'chai';
import { Client } from 'discord.js';
import { SinonFakeTimers } from 'sinon';
import sinon, {stubInterface} from 'ts-sinon';
import * as birthdayActions from '../src/bot/actions/birthdayActions';
import {startCheckBirthdaysProcess} from '../src/backgroundProcesses';
import {autoStub} from './stubs';

describe('backgroundProcesses', () => {
    describe('startCheckBirthdaysProcess', () => {

        let client: Client, clock: SinonFakeTimers;
        beforeEach(() => {
            client = stubInterface();
            clock = sinon.useFakeTimers();
        });
        afterEach(() => {
            clock.restore();
        });
        const stub_postBirthdays = autoStub(birthdayActions, 'postOccurringBirthdays', async () => undefined);

        it('should call postBirthdays immediately', () => {
            startCheckBirthdaysProcess(client);
            expect(stub_postBirthdays).calledOnceWithExactly(client);
        });
        it('should call postBirthdays one extra time after 24 hours', () => {
            startCheckBirthdaysProcess(client);
            clock.tick(24 * 60 * 60 * 1000);
            expect(stub_postBirthdays).calledTwice;
            expect(stub_postBirthdays).calledWithExactly(client);
        });
        it('should call postBirthdays one time every 24 hours', () => {
            startCheckBirthdaysProcess(client);
            for(let i = 0; i < 10; i++) {
                expect(stub_postBirthdays).callCount(i + 1);
                expect(stub_postBirthdays).calledWithExactly(client);
                clock.tick(24 * 60 * 60 * 1000);
            }
        });
    });
});