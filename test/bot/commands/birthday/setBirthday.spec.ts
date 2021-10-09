import { Client, Guild, GuildMember, GuildMemberManager, Message, TextChannel, User } from "discord.js";
import { stubInterface } from "ts-sinon";
import { autoStub, stubWithSession } from "../../../stubs";
import {setBirthday} from '../../../../src/bot/commands/birthday/setBirthday';
import * as strings from '../../../../src/utils/strings';
import * as dates from '../../../../src/utils/dates';
import * as messageErrorActions from '../../../../src/bot/actions/messageErrorActions';
import * as sendMessageActions from '../../../../src/bot/actions/sendMessageActions';
import * as dbBirthdays from '../../../../src/database/collections/birthdays';
import * as db from '../../../../src/database';
import { expect } from "chai";


describe('bot commands birthday', () => {

    describe('setBirthday', () => {
        
        const client = stubInterface<Client>();
        const text = 'my text';
        const channel = stubInterface<TextChannel>();
        const author = stubInterface<User>();
        const authorMember = {displayName: 'author name'} as unknown as GuildMember;
        const guildMembers = stubInterface<GuildMemberManager>({fetch: authorMember} as any);

        const guild = {id: 'guild id', members: guildMembers} as unknown as Guild;
        const message = {guild, channel, author} as unknown as Message;

        const foundDate = new Date(5);
        const name = 'Name';
        
        const getErrorBase = () => `I had some issues completing the request:`
        const getMissingDateError = (subText) => `\n  - What's ${subText} birthday? I can process a few different formats, but try something like 9/2/94`;
        const getMissingNameError = () => `\n  - Whose birthday should I register? Ask me again, but include the name of someone, like "...Tyler\'s birthday..."`

        const stub_findDateInText = autoStub(dates, 'findDateInText', foundDate);
        const stub_findBirthdayOwnerInText = autoStub(strings, 'findBirthdayOwnerInText', name);
        const {stub_withSession, ctx} = stubWithSession();
        const stub_upsertBirthday = autoStub(dbBirthdays, 'upsertBirthday', Promise.resolve({upserted: true, upsertedCount: 1}));
        const stub_sendSuccess = autoStub(sendMessageActions, 'sendSuccess');
        const stub_saveMessageError = autoStub(messageErrorActions, 'saveMessageError');

        describe('with valid input', () => {
            it('should open the database connection', async () => {
                await setBirthday.run(client, message, text);
                expect(stub_withSession).to.have.been.calledOnce;
            });
            it('should upsert the information', async () => {
                await setBirthday.run(client, message, text);
                expect(stub_upsertBirthday).to.have.been.calledOnceWithExactly(ctx, guild.id, name, foundDate);
            });
            it('should return success to the message', async () => {
                await setBirthday.run(client, message, text);
                expect(stub_sendSuccess).to.have.been.calledOnceWithExactly(message);
            });

            describe('when the birthday owner is self', () => {
                beforeEach(() => {
                    stub_findBirthdayOwnerInText.returns('self');
                });
                it('should fetch the author user as a member', async () => {
                    await setBirthday.run(client, message, text);
                    expect(guildMembers.fetch).to.be.calledOnceWithExactly({user: author});
                });
                it('should save the author\'s display name', async () => {
                    await setBirthday.run(client, message, text);
                    expect(stub_upsertBirthday).to.be.calledOnceWithExactly(ctx, guild.id, authorMember.displayName, foundDate);
                });
            });
        });

        describe('when no date is provided', () => {

            beforeEach(() => {
                stub_findDateInText.returns(null);
            });
            it('should save the error using the target name when it is available', async () => {
                await setBirthday.run(client, message, text);
                expect(stub_saveMessageError).to.have.been.calledOnceWithExactly(message, getErrorBase() + getMissingDateError(`${name}'s`));
            });
            it('should save the error using \'your birthday\' when the target is self', async () => {
                stub_findBirthdayOwnerInText.returns('self');
                await setBirthday.run(client, message, text);
                expect(stub_saveMessageError).to.have.been.calledOnceWithExactly(message, getErrorBase() + getMissingDateError(`your`));
            });
            it('should save both errors using \'the birthday\' when the target is missing', async () => {
                stub_findBirthdayOwnerInText.returns(null);
                await setBirthday.run(client, message, text);
                expect(stub_saveMessageError).to.have.been.calledOnceWithExactly(message, getErrorBase() + getMissingNameError() + getMissingDateError(`the`));
            });
            it('should not call the database', async () => {
                await setBirthday.run(client, message, text);
                expect(stub_upsertBirthday).to.have.not.been.called;
            });
        });

        describe('when no birthday owner is provided', () => {
            beforeEach(() => {
                stub_findBirthdayOwnerInText.returns(null);
            });
            it('should save the error', async () => {
                await setBirthday.run(client, message, text);
                expect(stub_saveMessageError).to.have.been.calledOnceWithExactly(
                    message, getErrorBase() + getMissingNameError())
            });
            it('should not call the database', async () => {
                await setBirthday.run(client, message, text);
                expect(stub_upsertBirthday).to.have.not.been.called;
            });
        });
    });
});