import { Client, Guild, Message } from "discord.js";
import {stubInterface} from 'ts-sinon';
import {CommandSpec} from '../../../src/typings/CommandSpec';
import {runCommand} from '../../../src/bot/commands';
import * as messageErrorActions from '../../../src/bot/actions/messageErrorActions';
import { expect } from "chai";
import emoji from "../../../src/bot/data/emoji";
import { SinonStub, stub } from "sinon";
import {autoStub} from '../../stubs';


describe('bot commands', () => {
    describe('runCommand', () => {


        let client: Client, message: Message, command: CommandSpec, text: string;
        let run: SinonStub;
        beforeEach(() => {
            client = stubInterface();
            message = stubInterface();
            command = stubInterface();
            command.name = 'my command'
            command.restrictions = undefined;
            command.run = run = stub();
            text = 'my text';
        });

        const stub_saveMessageError = autoStub(messageErrorActions, 'saveMessageError');
        const stub_consoleError = autoStub(console, 'error');

        const restrictionErrorBase = `I couldn't complete your request:\n  - `;

        const itPassesAllRestrictions = () => {
            it('runs the command', async () => {
                await runCommand(command, client, message, text);
                expect(command.run).calledOnceWithExactly(client, message, text);
            });
            describe('when the command throws an error', () => {
                const error = new Error('test error');
                beforeEach(() => run.throws(error));
                it('logs the error', async () => {
                    await runCommand(command, client, message, text);
                    expect(stub_consoleError).calledOnceWithExactly(error);
                });
                it('saves the error', async () => {
                    await runCommand(command, client, message, text);
                    expect(stub_saveMessageError).calledOnceWithExactly(message, error);
                });
            });
        };

        const itShouldNotRunTheCommand = () => 
            it('should not run the command', async () => {
                await runCommand(command, client, message, text);
                expect(run).to.have.not.been.called;
            });

        describe('no restrictions', () => {
            beforeEach(() => command.restrictions = undefined);
            itPassesAllRestrictions();
        });
        describe('with guildOnly restrictions', () => {
            beforeEach(() => command.restrictions = ['guildOnly']);

            describe('when the message is not in a guild', () => {
                beforeEach(() => Object.defineProperty(message, 'guild', {value: null}));
                it('should save the restriction error', async () => {
                    await runCommand(command, client, message, text);
                    expect(stub_saveMessageError).calledOnceWithExactly(message, restrictionErrorBase + `I can only '${command.name}' in a Guild.`)
                });
                itShouldNotRunTheCommand();
            });

            describe('when the message is in a guild', () => {
                beforeEach(() => Object.defineProperty(message, 'guild', {value: stubInterface<Guild>()}));
                itPassesAllRestrictions();
            });
        });
        describe('with invalid restrictions', () => {
            itPassesAllRestrictions();
        });
    });
});