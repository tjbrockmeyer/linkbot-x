import { expect } from 'chai';
import { autoStub } from '../stubs';
import { onMessageCreate, onError, onWarn, onMessageReactionAdd, onReady } from '../../src/bot/events';
import { stubInterface } from 'ts-sinon';
import { Client, Message, MessageReaction, TextChannel, User } from 'discord.js';
import { ClassificationResult } from '../../src/typings/ClassificationResult';
import * as commands from '../../src/bot/commands';
import * as responses from '../../src/bot/data/responses';
import * as commandClassifier from '../../src/bot/commands/commandClassifier';
import * as messageErrorActions from '../../src/bot/actions/messageErrorActions';


describe('bot events', () => {

    describe('onMessageCreate', () => {

        let client: Client, message: Message, classificationResult: ClassificationResult;
        beforeEach(() => {
            client = stubInterface();
            client.user = stubInterface();
            client.user.id = 'client user id';
            message = stubInterface<Message>();
            message.author = stubInterface();
            message.author.id = 'message author id';
            message.content = `${process.env.CMD_PREFIX || '!'} this is the message content`;
            Object.defineProperty(message, 'channel', { value: stubInterface<TextChannel>() });
            classificationResult = stubInterface();
            classificationResult.command = stubInterface();
            classificationResult.status = 'success';
        });

        const randomResponse = 'my random response';

        const stub_runCommand = autoStub(commands, 'runCommand');
        const stub_getRandomResponse = autoStub(responses, 'getRandomResponse', () => randomResponse);
        const stub_classify = autoStub(commandClassifier, 'classify', () => classificationResult);
        const stub_saveMessageError = autoStub(messageErrorActions, 'saveMessageError');

        const itShouldNotClassify = () =>
            it('should not attempt to classify the message', async () => {
                await onMessageCreate(client, message);
                expect(stub_classify).to.not.be.called;
            });

        const itShouldSaveTheError = (responseType: string) =>
            it('should save the error', async () => {
                await onMessageCreate(client, message);
                expect(stub_getRandomResponse).calledOnceWithExactly(responseType);
                expect(stub_saveMessageError).calledOnceWithExactly(message, randomResponse);
                expect(stub_runCommand).to.not.be.called;
            });

        describe('when the message is from this client', () => {
            beforeEach(() => message.author.id = client.user.id);
            itShouldNotClassify();
        });
        describe('when the message does not start with the command prefix', () => {
            beforeEach(() => message.content = 'not the right prefix' + message.content);
            itShouldNotClassify();
        });

        describe('when the classification is successful', () => {
            it('should call run command with the command in the classification result', async () => {
                const text = 'this is the message content';
                await onMessageCreate(client, message);
                expect(stub_runCommand).calledOnceWithExactly(classificationResult.command, client, message, text);
            });
        });

        describe('when the classification found nothing', () => {
            beforeEach(() => classificationResult.status = 'no results');
            itShouldSaveTheError('noIdea');
        });
        describe('when the classification found multiple valid results', () => {
            beforeEach(() => classificationResult.status = 'multiple results');
            itShouldSaveTheError('unsure');
        });

    });
    describe('onMessageReactionAdd', () => {
        const stub_consoleLog = autoStub(console, 'info');
        
        it('should do something', async () => {
            const client = stubInterface<Client>();
            const reaction = stubInterface<MessageReaction>();
            const user = stubInterface<User>();
            await onMessageReactionAdd(client, reaction, user);
        });
    });
    describe('onReady', () => {
        const stub_consoleLog = autoStub(console, 'info');

        it('should do something', async () => {
            const client = stubInterface<Client>();
            await onReady(client);
        });
    });
    describe('onError', () => {

        const client = stubInterface<Client>();
        const error = new Error('test error');
        const stub_consoleError = autoStub(console, 'error');

        it('should call console error with the error message', async () => {
            await onError(client, error);
            expect(stub_consoleError).calledOnceWithExactly('a client error occurred:', error);
        });
    });
    describe('onWarn', () => {

        const client = stubInterface<Client>();
        const warning = 'test warning'
        const stub_consoleWarn = autoStub(console, 'warn');

        it('should call console error with the error message', async () => {
            await onWarn(client, warning);
            expect(stub_consoleWarn).calledOnceWithExactly('a client warning occurred:', warning);
        });
    });
});