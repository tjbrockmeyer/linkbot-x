import { Client, Guild, GuildMember, GuildMemberManager, Message, TextChannel, User } from "discord.js";
import { stubInterface } from "ts-sinon";
import { autoStub, stubWithSession } from "../../../stubs";
import {showBirthday} from '../../../../src/bot/commands/birthday/showBirthday';
import * as strings from '../../../../src/utils/strings';
import * as dates from '../../../../src/utils/dates';
import * as messageErrorActions from '../../../../src/bot/actions/messageErrorActions';
import * as sendMessageActions from '../../../../src/bot/actions/sendMessageActions';
import * as dbBirthdays from '../../../../src/database/collections/birthdays';
import * as db from '../../../../src/database';
import { expect } from "chai";
import { Birthday } from "../../../../src/typings/database/Birthday";


describe('bot commands birthday', () => {

    describe('showBirthday', () => {

        const text = 'my text';
        let client: Client, message: Message, birthdays: Birthday[];
        beforeEach(() => {
            client = stubInterface();
            message = stubInterface();
            Object.defineProperty(message, 'channel', {value: stubInterface<TextChannel>()});
            Object.defineProperty(message, 'guild', {value: stubInterface<Guild>()});
            message.guild.id = 'my guild';
            birthdays = [
                {guildId: 'my guild', name: 'Me', birthday: {month: 9, day: 2}},
                {guildId: 'my guild', name: 'Him', birthday: {month: 5, day: 1}},
            ];
        });

        const {ctx, stub_withSession} = stubWithSession();
        const stub_readBirthdays = autoStub(dbBirthdays, 'readBirthdays', () => Promise.resolve(birthdays));

        it('should search for birthdays from the guild', async () => {
            await showBirthday.run(client, message, text);
            expect(stub_withSession).to.be.calledOnce;
            expect(stub_readBirthdays).calledOnceWithExactly(ctx, message.guild.id);
        });
        
        describe('when there are no known birthdays', () => {
            beforeEach(() => stub_readBirthdays.resolves([]));
            it('should send a message stating that there are no known birthdays', async () => {
                await showBirthday.run(client, message, text);
                expect(message.channel.send).calledOnceWithExactly(`I don't know any birthdays yet. Try something like "set my birthday to 9/2/94"`);
            });
        });
        it('should reply with the full list of formatted birthdays', async () => {
            await showBirthday.run(client, message, text);
            const output = `These are the birthdays I know so far:\n  Me: 9/2\n  Him: 5/1`;
            expect(message.channel.send).calledOnceWithExactly(output);
        });
    });
});