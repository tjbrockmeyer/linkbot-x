import { Client, GuildMember, Message } from "discord.js";
import { StubbedInstance } from "ts-sinon";
import {DbStub, stubClient, stubDb, stubMessage} from "../../../testUtils/stubs";
import {setBirthday} from './setBirthday';
import { expect } from "chai";
import { SinonStub, stub } from "sinon";
import * as strings from '../../../utils/strings';
import * as dates from '../../../utils/dates';
import * as messageErrorActions from '../../actions/messageErrorActions';
import * as sendMessageActions from '../../actions/sendMessageActions';
import * as dbBirthdays from '../../../database/collections/birthdays';


describe('bot commands birthday', () => {

    describe('setBirthday', () => {
        
        const text = 'my text';
        const foundDate = new Date(5);
        const name = 'Name';
        
        const getErrorBase = () => `I had some issues completing the request:`
        const getMissingDateError = (subText: string) => `\n  - What's ${subText} birthday? I can process a few different formats, but try something like 9/2/94`;
        const getMissingNameError = () => `\n  - Whose birthday should I register? Ask me again, but include the name of someone, like "...Tyler\'s birthday..."`

        let stub_findDateInText: SinonStub;
        let stub_findBirthdayOwnerInText: SinonStub;
        let stub_upsertBirthday: SinonStub;
        let stub_sendSuccess: SinonStub;
        let stub_saveMessageError: SinonStub;
        let dbStub: DbStub;

        let client: StubbedInstance<Client>;
        let message: StubbedInstance<Message>;

        beforeEach(() => {
            stub_findDateInText = stub(dates, 'findDateInText').returns(foundDate);
            stub_findBirthdayOwnerInText = stub(strings, 'findBirthdayOwnerInText').returns(name);
            stub_upsertBirthday = stub(dbBirthdays, 'upsertBirthday').resolves({upserted: true, upsertedCount: 1});
            stub_sendSuccess = stub(sendMessageActions, 'sendSuccess');
            stub_saveMessageError = stub(messageErrorActions, 'saveMessageError');
            dbStub = stubDb();

            client = stubClient();
            message = stubMessage(text);
        });

        describe('with valid input', () => {
            it('should open the database connection', async () => {
                await setBirthday.run(client, message, text);
                expect(dbStub.withSession).to.have.been.calledOnce;
            });
            it('should upsert the information', async () => {
                await setBirthday.run(client, message, text);
                expect(stub_upsertBirthday).to.have.been.calledOnceWithExactly(dbStub.ctx, message.guild?.id, name, foundDate);
            });
            it('should return success to the message', async () => {
                await setBirthday.run(client, message, text);
                expect(stub_sendSuccess).to.have.been.calledOnceWithExactly(message);
            });

            describe('when the birthday owner is self', () => {
                beforeEach(() => {
                    stub_findBirthdayOwnerInText.returns('self');
                });
                it('should save the author\'s display name', async () => {
                    await setBirthday.run(client, message, text);
                    expect(stub_upsertBirthday).to.be.calledOnceWithExactly(dbStub.ctx, message.guild?.id, message.member.displayName, foundDate);
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