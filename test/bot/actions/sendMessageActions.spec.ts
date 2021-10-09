import { expect } from 'chai';
import { sendMessage, sendSuccess } from './../../../src/bot/actions/sendMessageActions';
import { stubInterface } from 'ts-sinon';
import { Message, TextChannel } from 'discord.js';
import { stub } from 'sinon';
import emoji from '../../../src/bot/data/emoji';


describe('bot actions sendMessageActions', () => {

    describe('sendMessage', () => {

        it('should send the response as text to the channel found in the request', async () => {
            const channel = stubInterface<TextChannel>();
            const text = 'my text';
            await sendMessage(channel, text);
            expect(channel.send).to.have.been.calledOnceWithExactly(text);
        });
    });
    describe('sendSuccess', () => {

        it('should send a checkmark emoji as a reaction to the message', async () => {
            const message = stubInterface<Message>();
            await sendSuccess(message);
            expect(message.react).to.have.been.calledOnceWithExactly(emoji.whiteCheckMark);
        });
    });
});