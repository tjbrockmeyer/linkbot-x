import { expect } from "chai";
import { Client, Guild, GuildManager, TextChannel } from "discord.js";
import {postOccurringBirthdays} from '../../../src/bot/actions/birthdayActions';
import * as dbPostedBirthdays from '../../../src/database/collections/postedBirthdays';
import * as dbBirthdays from '../../../src/database/collections/birthdays';
import * as dates from '../../../src/utils/dates';
import * as strings from '../../../src/utils/strings';
import * as guildActions from '../../../src/bot/actions/guildActions';
import { Birthday } from "../../../src/typings/database/Birthday";
import { WithId } from "mongodb";
import {ObjectId} from 'bson';
import { DbStub, stubClient, stubDb, stubGuild, stubGuildManager, stubTextChannel } from "../../testUtils/stubs";
import { SinonStub, stub } from "sinon";
import { StubbedInstance } from "ts-sinon";


describe('bot actions birthdayActions', () => {
    describe('postOccurringBirthdays', () => {

        const singleBirthdayList: WithId<Birthday>[] = [
            {
                _id: new ObjectId('123456789001'),
                guildId: 'guild 1',
                name: 'tyler',
                birthday: {month: 9, day: 2}
            }
        ];
        const manyBirthdaysList: WithId<Birthday>[] = [
            ...singleBirthdayList,
            {
                _id: new ObjectId('123456789003'),
                guildId: 'guild 1',
                name: 'guy',
                birthday: {month: 9, day: 2}
            },
        ];
        const singleBirthdayPostedStatus: boolean[] = singleBirthdayList.map(() => false);
        const manyBirthdaysPostedStatus: boolean[] = manyBirthdaysList.map(() => false);

        let systemChannel: StubbedInstance<TextChannel>;
        let postableChannel: StubbedInstance<TextChannel>;
        let guild: StubbedInstance<Guild>;
        let guildManager: StubbedInstance<GuildManager>;
        let client: StubbedInstance<Client>;

        let stub_readBirthdays: SinonStub;
        let stub_getPostedBirthdayStatus: SinonStub;
        let stub_insertPostedBirthdays: SinonStub;
        let stub_today: SinonStub;
        let stub_joinWithAnd: SinonStub;
        let stub_getPostableChannel: SinonStub;
        let dbStub: DbStub;

        beforeEach(() => {
            systemChannel = stubTextChannel();
            postableChannel = stubTextChannel();
            guild = stubGuild('guild id');
            guildManager = stubGuildManager(guild);
            client = stubClient();
            client.guilds = guildManager;

            stub_readBirthdays = stub(dbBirthdays, 'readBirthdays').resolves(singleBirthdayList);
            stub_getPostedBirthdayStatus = stub(dbPostedBirthdays, 'getPostedBirthdayStatus').resolves(singleBirthdayPostedStatus);
            stub_insertPostedBirthdays = stub(dbPostedBirthdays, 'insertPostedBirthdays');
            stub_today = stub(dates, 'today').returns(new Date('09/02/2020'));
            stub_joinWithAnd = stub(strings, 'joinWithAnd').returns('tyler and guy');
            stub_getPostableChannel = stub(guildActions, 'getPostableChannel').resolves(postableChannel);
            dbStub = stubDb();
        })

        const itShouldNotFetchGuilds = () => it('should not fetch any guilds', async () => {
            await postOccurringBirthdays(client);
            expect(client.guilds.fetch).to.have.not.been.called;
        });

        describe('when today is not anyones birthday', () => {
            beforeEach(() => {
                stub_readBirthdays.resolves([]);
                stub_getPostedBirthdayStatus.resolves([]);
            });
            itShouldNotFetchGuilds();
        });
        describe('when all birthdays are already posted', () => {
            beforeEach(() => stub_getPostedBirthdayStatus.resolves(singleBirthdayList.map(() => true)));
            itShouldNotFetchGuilds();
        });
        describe('when a system channel exists for the guild', () => {
            beforeEach(() => {
                Object.defineProperty(guild, 'systemChannel', {value: systemChannel})
            });
            it('should post in the system channel', async () => {
                await postOccurringBirthdays(client);
                expect(systemChannel.send).calledOnce;
            });
            describe('when there is only one birthday for the guild today', () => {
                beforeEach(() => {
                    stub_readBirthdays.resolves(singleBirthdayList);
                    stub_getPostedBirthdayStatus.resolves(singleBirthdayPostedStatus);
                });
                it('should post the message with text for one person', async () => {
                    await postOccurringBirthdays(client);
                    expect(systemChannel.send).calledWithExactly('Today is tyler\'s birthday!');
                });
                it('should mark in the database that the birthday was posted', async () => {
                    await postOccurringBirthdays(client);
                    expect(stub_insertPostedBirthdays).calledOnceWithExactly(dbStub.ctx, [singleBirthdayList[0]._id]);
                });
            });
            describe('when there multiple birthdays for the guild today', () => {
                beforeEach(() => {
                    stub_readBirthdays.resolves(manyBirthdaysList);
                    stub_getPostedBirthdayStatus.resolves(manyBirthdaysPostedStatus);
                });
                it('should post the message with text for multiple people', async () => {
                    await postOccurringBirthdays(client);
                    expect(systemChannel.send).calledWithExactly('Today is tyler and guy\'s birthdays!');
                });
            });
        });
        describe('when there is not a system channel for the guild', () => {
            beforeEach(() => Object.defineProperty(guild, 'systemChannel', {value: null}));
            it('should search for a postable channel', async () => {
                await postOccurringBirthdays(client);
                expect(stub_getPostableChannel).calledOnceWithExactly(client, guild);
            });
            describe('when a postable channel is found', () => {
                it('should post in that postable channel', async () => {
                    await postOccurringBirthdays(client);
                    expect(postableChannel.send).calledOnce;
                });
            });
        });
    });
});