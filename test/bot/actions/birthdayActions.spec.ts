import { expect } from "chai";
import { Channel, Client, Guild, GuildChannelManager, GuildManager, GuildMember, GuildMemberManager, Permissions, TextChannel, User, VoiceChannel } from "discord.js";
import { createSandbox, SinonStub, stub } from "sinon";
import { stubInterface } from "ts-sinon";
import {postOccurringBirthdays} from '../../../src/bot/actions/birthdayActions';
import { autoStub, autoMock, stubWithSession } from "../../stubs";
import * as dbPostedBirthdays from '../../../src/database/collections/postedBirthdays';
import * as dbBirthdays from '../../../src/database/collections/birthdays';
import * as dates from '../../../src/utils/dates';
import * as strings from '../../../src/utils/strings';
import * as guildActions from '../../../src/bot/actions/guildActions';
import { Birthday } from "../../../src/typings/database/Birthday";
import { WithId } from "mongodb";
import {ObjectId} from 'bson';


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
        
        const mock_systemChannel = autoMock<TextChannel>({
            send: () => undefined,
        });
        const mock_postableChannel = autoMock<TextChannel>({
            send: () => undefined,
        });
        const mock_guild = autoMock<Guild>(() => ({
            systemChannel: mock_systemChannel.obj,
        }));
        const mock_clientGuilds = autoMock<GuildManager>(() => ({
            fetch: () => mock_guild.obj,
        }));
        const mock_client = autoMock<Client>(() => ({
            guilds: mock_clientGuilds.obj,
        }));
        const {ctx, stub_withSession} = stubWithSession();
        const stub_readBirthdays = autoStub(dbBirthdays, 'readBirthdays', async () => singleBirthdayList);
        const stub_getPostedBirthdayStatus = autoStub(dbPostedBirthdays, 'getPostedBirthdayStatus', async () => singleBirthdayPostedStatus);
        const stub_insertPostedBirthdays = autoStub(dbPostedBirthdays, 'insertPostedBirthdays');
        const stub_today = autoStub(dates, 'today', () => new Date('09/02/2020'));
        const stub_joinWithAnd = autoStub(strings, 'joinWithAnd', () => 'tyler and guy');
        const stub_getPostableChannel = autoStub(guildActions, 'getPostableChannel', async () => mock_postableChannel.obj);

        const itShouldNotFetchGuilds = () => it('should not fetch any guilds', async () => {
            await postOccurringBirthdays(mock_client.obj);
            expect(mock_clientGuilds.stub_fetch).to.have.not.been.called;
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
            beforeEach(() => Object.defineProperty(mock_guild.obj, 'systemChannel', {value: mock_systemChannel.obj}));
            it('should post in the system channel', async () => {
                await postOccurringBirthdays(mock_client.obj);
                expect(mock_systemChannel.stub_send).calledOnce;
            });
            describe('when there is only one birthday for the guild today', () => {
                beforeEach(() => {
                    stub_readBirthdays.resolves(singleBirthdayList);
                    stub_getPostedBirthdayStatus.resolves(singleBirthdayPostedStatus);
                });
                it('should post the message with text for one person', async () => {
                    await postOccurringBirthdays(mock_client.obj);
                    expect(mock_systemChannel.stub_send).calledWithExactly('Today is tyler\'s birthday!');
                });
                it('should mark in the database that the birthday was posted', async () => {
                    await postOccurringBirthdays(mock_client.obj);
                    expect(stub_insertPostedBirthdays).calledOnceWithExactly(ctx, [singleBirthdayList[0]._id]);
                });
            });
            describe('when there multiple birthdays for the guild today', () => {
                beforeEach(() => {
                    stub_readBirthdays.resolves(manyBirthdaysList);
                    stub_getPostedBirthdayStatus.resolves(manyBirthdaysPostedStatus);
                });
                it('should post the message with text for multiple people', async () => {
                    await postOccurringBirthdays(mock_client.obj);
                    expect(mock_systemChannel.stub_send).calledWithExactly('Today is tyler and guy\'s birthdays!');
                });
            });
        });
        describe('when there is not a system channel for the guild', () => {
            beforeEach(() => Object.defineProperty(mock_guild.obj, 'systemChannel', {value: null}));
            it('should search for a postable channel', async () => {
                await postOccurringBirthdays(mock_client.obj);
                expect(stub_getPostableChannel).calledOnceWithExactly(mock_client.obj, mock_guild.obj);
            });
            describe('when a postable channel is found', () => {
                it('should post in that postable channel', async () => {
                    await postOccurringBirthdays(mock_client.obj);
                    expect(mock_postableChannel.stub_send).calledOnce;
                });
            });
        });
    });
});