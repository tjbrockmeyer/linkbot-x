import { expect } from "chai";
import { Client, ClientUser, Guild, GuildChannelManager, GuildManager, GuildMember, GuildMemberManager, Permissions, TextChannel, User, VoiceChannel } from "discord.js";
import { StubbedInstance, stubInterface } from "ts-sinon";
import {getPostableChannel} from '../../../src/bot/actions/guildActions';
import { stubClient, stubGuild, stubGuildChannelManager, stubGuildManager, stubGuildMemberManager, stubPermissions, stubTextChannel, stubVoiceChannel } from "../../testUtils/stubs";


describe('bot actions guildActions', () => {
    describe('getPostableChannel', () => {

        let client: StubbedInstance<Client>;
        let guild: StubbedInstance<Guild>;
        let permissions: StubbedInstance<Permissions>;
        let guildMemberManager: StubbedInstance<GuildMemberManager>;
        let clientMember: StubbedInstance<GuildMember>;
        let guildChannelManager: StubbedInstance<GuildChannelManager>;
        let voiceChannel: StubbedInstance<VoiceChannel>;
        let textChannel: StubbedInstance<TextChannel>;

        beforeEach(() => {
            client = stubClient();
            guild = stubGuild();
            permissions = stubPermissions();
            voiceChannel = stubVoiceChannel();
            textChannel = stubTextChannel();
            clientMember = stubInterface();
            clientMember.user = client.user as ClientUser;
            guildMemberManager = stubGuildMemberManager(clientMember);
            guildChannelManager = stubGuildChannelManager([textChannel]);
            guild.channels = guildChannelManager;
            guild.members = guildMemberManager;
        });

        describe('when the client has no user', () => {
            beforeEach(() => client.user = null);

            it('should not fetch channels or members', async () => {
                await getPostableChannel(client, guild);
                expect(guildChannelManager.fetch).to.have.not.been.called;
                expect(guildMemberManager.fetch).to.have.not.been.called;
            });
        });

        const itShouldReturnNull = () => it('should return null', async () => {
            const result = await getPostableChannel(client, guild);
            expect(result).is.null;
        });
        describe('when no channels are text channels', async () => {
            beforeEach(() => guildChannelManager.fetch.resolves([voiceChannel] as any));
            itShouldReturnNull();
        });
        describe('when the bot does not have the correct permissions in any text channels', () => {
            beforeEach(() => {
                textChannel.permissionsFor.returns(permissions);
                permissions.has.returns(false)
            });
            itShouldReturnNull();
        });
        it('should return the guild channel that was found', async () => {
            const result = await getPostableChannel(client, guild);
            expect(result).equals(textChannel);
        });
    });
});