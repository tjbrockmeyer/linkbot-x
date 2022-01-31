import { expect } from 'chai';
import { onMessageCreate, onError, onWarn, onMessageReactionAdd, onReady } from './events';
import { StubbedInstance, stubInterface } from 'ts-sinon';
import { Client, Message, MessageReaction, User } from 'discord.js';
import { ClassificationResult } from '../typings/ClassificationResult';
import * as commands from './commands';
import * as responses from './data/responses';
import * as commandClassifier from './commands/commandClassifier';
import * as messageErrorActions from './actions/messageErrorActions';
import * as backgroundProcesses from '../backgroundProcesses';
import { stubClient, stubMessage } from '../testUtils/stubs';
import { restore, SinonStub, stub } from 'sinon';
import { CommandSpec } from '../typings/CommandSpec';


describe('bot events', () => {

    describe('onMessageCreate', () => {

        const randomResponse = 'my random response';

        let client: StubbedInstance<Client>;
        let message: StubbedInstance<Message>;
        let classificationResult: ClassificationResult;

        let stub_runCommand: SinonStub;
        let stub_getRandomResponse: SinonStub;
        let stub_classify: SinonStub;
        let stub_saveMessageError: SinonStub;

        beforeEach(() => {
            client = stubClient();
            message = stubMessage(`${process.env.CMD_PREFIX || '!'} this is the message content`);
            classificationResult = stubInterface();
            classificationResult.command = stubInterface<CommandSpec>();
            classificationResult.status = 'success';

            stub_runCommand = stub(commands, 'runCommand');
            stub_getRandomResponse = stub(responses, 'getRandomResponse').returns(randomResponse);
            stub_classify = stub(commandClassifier, 'classify').returns(classificationResult);
            stub_saveMessageError = stub(messageErrorActions, 'saveMessageError');
        });

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
            beforeEach(() => (message.author as User).id = (client.user as User).id);
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
        let stub_consoleInfo: SinonStub;
        beforeEach(() => {
            stub_consoleInfo = stub(console, 'info');
        });
        
        it('should do something', async () => {
            const client = stubInterface<Client>();
            const reaction = stubInterface<MessageReaction>();
            const user = stubInterface<User>();
            await onMessageReactionAdd(client, reaction, user);
        });
    });
    describe('onReady', () => {
        let stub_consoleInfo: SinonStub;
        let stub_startCheckBirthdaysProcess: SinonStub;
        beforeEach(() => {
            stub_consoleInfo = stub(console, 'info');
            stub_startCheckBirthdaysProcess = stub(backgroundProcesses, 'startCheckBirthdaysProcess');
        });

        it('should start the birthday check process', async () => {
            const client = stubInterface<Client>();
            await onReady(client);
            expect(stub_startCheckBirthdaysProcess).to.have.been.calledOnce;
        });
    });
    describe('onError', () => {

        const client = stubClient();
        const error = new Error('test error');

        let stub_consoleError: SinonStub;
        beforeEach(() => {
            stub_consoleError = stub(console, 'error');
        });

        it('should call console error with the error message', async () => {
            await onError(client, error);
            expect(stub_consoleError).calledOnceWithExactly('a client error occurred:', error);
        });
    });
    describe('onWarn', () => {

        const client = stubClient();
        const warning = 'test warning'

        let stub_consoleWarn: SinonStub;
        beforeEach(() => {
            stub_consoleWarn = stub(console, 'warn');
        });

        it('should call console error with the error message', async () => {
            await onWarn(client, warning);
            expect(stub_consoleWarn).calledOnceWithExactly('a client warning occurred:', warning);
        });
    });
});