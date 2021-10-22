import { Client, Message } from "discord.js";
import { StubbedInstance } from "ts-sinon";
import {showBirthday} from './showBirthday';
import * as dbBirthdays from '../../../database/collections/birthdays';
import { expect } from "chai";
import { Birthday } from "../../../typings/database/Birthday";
import { DbStub, stubClient, stubDb, stubMessage } from "../../../testUtils/stubs";
import { SinonStub, stub } from "sinon";
import { ObjectId, WithId } from "mongodb";


describe('bot commands birthday', () => {

    describe('showBirthday', () => {

        const text = 'my text';

        let client: StubbedInstance<Client>;
        let message: StubbedInstance<Message>;
        let birthdays: WithId<Birthday>[];
        let dbStub: DbStub;

        let stub_readBirthdays: SinonStub;

        beforeEach(() => {
            client = stubClient();
            message = stubMessage(text);
            birthdays = [
                {_id: new ObjectId(0), guildId: 'my guild', name: 'Me', birthday: {month: 9, day: 2}},
                {_id: new ObjectId(1), guildId: 'my guild', name: 'Him', birthday: {month: 5, day: 1}},
            ];
            dbStub = stubDb();

            stub_readBirthdays = stub(dbBirthdays, 'readBirthdays').resolves(birthdays);
        });
        

        it('should search for birthdays from the guild', async () => {
            await showBirthday.run(client, message, text);
            expect(dbStub.withSession).to.be.calledOnce;
            expect(stub_readBirthdays).calledOnceWithExactly(dbStub.ctx, message.guild?.id);
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