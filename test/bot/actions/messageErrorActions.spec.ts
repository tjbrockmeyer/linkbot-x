import * as dbMessageErrors from '../../../src/database/collections/messageErrors';
import {saveMessageError, sendMessageError, } from '../../../src/bot/actions/messageErrorActions';
import {stubInterface} from 'ts-sinon';
import { DMChannel, Message, User } from 'discord.js';
import { autoStub, stubWithSession } from '../../stubs';
import { expect } from 'chai';
import emoji from '../../../src/bot/data/emoji';
import { MessageError } from '../../../src/typings/database/MessageError';
import * as adminActions from '../../../src/bot/actions/adminActions';

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

    describe('sendMessageError', () => {

        let message: Message, user: User, messageError: MessageError;
        beforeEach(() => {
            message = stubInterface();
            message.id = 'message id';
            user = stubInterface();
            user.id = 'my user id';
            Object.defineProperty(user, 'dmChannel', {value: stubInterface<DMChannel>(), configurable: true});
            messageError = {
                messageId: 'message id',
                errorMessage: 'test error',
                stackTrace: 'my stack trace',
                insertionTime: new Date(5),
            };
        });

        const {ctx, stub_withSession} = stubWithSession();
        const stub_readMessageError = autoStub(dbMessageErrors, 'readMessageError', () => Promise.resolve(messageError));
        const stub_isAdmin = autoStub(adminActions, 'isAdmin', () => false);

        const itShouldSendAsPlainText = () => it('should send the error message as plain text', async () => {
            await sendMessageError(message, user);
            expect(user.dmChannel.send).calledOnceWithExactly(messageError.errorMessage);
        });

        describe('when the user is not messagable', () => {
            beforeEach(() => Object.defineProperty(user, 'dmChannel', {value: null}));
            it('should not attempt to look up the error', async () => {
                await sendMessageError(message, user);
                expect(stub_withSession).to.have.not.been.called;
                expect(stub_readMessageError).to.have.not.been.called;
            });
        });
        describe('when there is not a message error for the message', () => {
            beforeEach(() => stub_readMessageError.resolves(null));
            it('should not send a message to the user', async () => {
                await sendMessageError(message, user);
                expect(user.dmChannel.send).to.have.not.been.called;
            });
        });
        it('should look up the error for the message', async () => {
            await sendMessageError(message, user);
            expect(stub_readMessageError).calledOnceWithExactly(ctx, message.id);
        });
        it('should send the message to the user directly', async () => {
            await sendMessageError(message, user);
            expect(user.dmChannel.send).to.have.been.calledOnce;
        });
        describe('when there is no stack trace', () => {
            beforeEach(() => messageError.stackTrace = null);
            itShouldSendAsPlainText();
        });
        describe('when there is a stack trace', () => {
            beforeEach(() => messageError.stackTrace = 'my stack trace');
            
            describe('when the user is not an admin', () => {
                beforeEach(() => stub_isAdmin.returns(false));
                itShouldSendAsPlainText();
            });
            describe('when the user is an admin', () => {
                beforeEach(() => stub_isAdmin.returns(true));
                it('should send the error message as a code block with the stack trace included', async () => {
                    await sendMessageError(message, user);
                    expect(user.dmChannel.send).calledOnceWithExactly(`\`\`\`\n${messageError.errorMessage}\n${messageError.stackTrace}\n\`\`\``);
                });
            });
        });
    });
});