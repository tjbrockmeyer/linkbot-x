
import { expect } from 'chai';
import { Client } from 'discord.js';
import { restore, SinonFakeTimers, SinonStub, stub } from 'sinon';
import sinon, {StubbedInstance, stubInterface} from 'ts-sinon';
import * as birthdayActions from './bot/actions/birthdayActions';
import {startCheckBirthdaysProcess} from './backgroundProcesses';
import { stubClient } from './testUtils/stubs';

describe('backgroundProcesses', () => {
    describe('startCheckBirthdaysProcess', () => {

        let stub_postBirthdays: SinonStub;
        let client: StubbedInstance<Client>;
        let clock: SinonFakeTimers;

        beforeEach(() => {
            stub_postBirthdays = stub(birthdayActions, 'postOccurringBirthdays').resolves(undefined);
            client = stubClient();
            clock = sinon.useFakeTimers();
        });
        afterEach(() => {
            clock.restore();
        });

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
