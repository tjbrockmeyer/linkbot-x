import * as dbMessageErrors from '../../../src/database/collections/messageErrors';
import {saveMessageError} from '../../../src/bot/actions/messageErrorActions';
import {stubInterface} from 'ts-sinon';
import { Message } from 'discord.js';
import { autoStub, stubWithSession } from '../../stubs';
import { expect } from 'chai';
import emoji from '../../../src/bot/data/emoji';

describe('bot actions', () => {
    describe('saveMessageError', () => {

        let message;
        beforeEach(() => {
            message = stubInterface<Message>();
            message.id = 'message id';
        });

        const stub_insertMessageError = autoStub(dbMessageErrors, 'insertMessageError');
        const {ctx, stub_withSession} = stubWithSession();
        const error = new Error('test error');

        it('should open a database connection', async () => {
            await saveMessageError(message, error);
            expect(stub_withSession).calledOnce;
        });
        it('should save the error with the message id and stack', async () => {
            await saveMessageError(message, error);
            expect(stub_insertMessageError).calledOnceWithExactly(ctx, message.id, error.message, error.stack);
        });
        it('should save a text error with the message id and null for the stack', async () => {
            const textError = 'my error';
            await saveMessageError(message, textError);
            expect(stub_insertMessageError).calledOnceWithExactly(ctx, message.id, textError, null);
        });
        it('should react to the originating message with an X', async () => {
            await saveMessageError(message, error);
            expect(message.react).calledOnceWithExactly(emoji.x);
        });
    });
});