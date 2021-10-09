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


describe('bot commands birthday', () => {

    describe('showBirthday', () => {
        const client = stubInterface<Client>();
        const text = 'my text';
        const message = stubInterface<Message>();
        
        it('should do something', async () => {
            await showBirthday.run(client, message, text);
        });
    });
});