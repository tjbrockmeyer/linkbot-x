import { Client, Guild, GuildMember, GuildMemberManager, Message, TextChannel, User } from "discord.js";
import { stubInterface } from "ts-sinon";
import {lookupLeagueOfLegends} from '../../../../src/bot/commands/leagueOfLegends/lookupLeagueGame';


describe('bot commands leagueOfLegends', () => {

    describe('lookupLeagueGame', () => {
        const client = stubInterface<Client>();
        const text = 'my text';
        const message = stubInterface<Message>();
        
        it('should do something', async () => {
            await lookupLeagueOfLegends.run(client, message, text);
        });
    });
});