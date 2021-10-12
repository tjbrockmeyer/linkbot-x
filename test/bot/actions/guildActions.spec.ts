import { expect } from "chai";
import { Channel, Client, Guild, GuildChannelManager, GuildMember, GuildMemberManager, Permissions, TextChannel, User, VoiceChannel } from "discord.js";
import { createSandbox, SinonStub, stub } from "sinon";
import { stubInterface } from "ts-sinon";
import {getPostableChannel} from '../../../src/bot/actions/guildActions';
import { autoMock } from "../../stubs";


describe('bot actions guildActions', () => {
    describe('getPostableChannel', () => {

        const mock_permissions = autoMock<Permissions>({
            has: () => true
        });
        const mock_clientUser = autoMock<User>({});
        const mock_client = autoMock<Client>(() => ({
            user: mock_clientUser.obj
        }));
        const mock_clientMember = autoMock<GuildMember>({});
        const mock_textChannel = autoMock<TextChannel>(() => ({
            isText: () => true,
            permissionsFor: () => mock_permissions.obj
        }));
        const mock_voiceChannel = autoMock<VoiceChannel>(() => ({
            isText: () => false,
            permissionsFor: () => mock_permissions.obj
        }));
        const mock_guildMembers = autoMock<GuildMemberManager>(() => ({
            fetch: () => Promise.resolve([mock_clientMember.obj] as any)
        }));
        const mock_guildChannels = autoMock<GuildChannelManager>(() => ({
            fetch: () => Promise.resolve([mock_textChannel.obj] as any)
        }));
        const mock_guild = autoMock<Guild>(() => ({
            channels: mock_guildChannels.obj,
            members: mock_guildMembers.obj
        }));

        describe('when the client has no user', () => {
            beforeEach(() => mock_client.obj.user = null);

            it('should not fetch channels or members', async () => {
                await getPostableChannel(mock_client.obj, mock_guild.obj);
                expect(mock_guildChannels.stub_fetch).to.have.not.been.called;
                expect(mock_guildMembers.stub_fetch).to.have.not.been.called;
            });
        });

        const itShouldReturnNull = () => it('should return null', async () => {
            const result = await getPostableChannel(mock_client.obj, mock_guild.obj);
            expect(result).is.null;
        });
        describe('when no channels are text channels', async () => {
            beforeEach(() => mock_guildChannels.stub_fetch.resolves([mock_voiceChannel.obj]));
            itShouldReturnNull();
        });
        describe('when the bot does not have the correct permissions in any text channels', () => {
            beforeEach(() => mock_permissions.stub_has.returns(false));
            itShouldReturnNull();
        });
        it('should return the guild channel that was found', async () => {
            const result = await getPostableChannel(mock_client.obj, mock_guild.obj);
            expect(result).equals(mock_textChannel.obj);
        });
    });
});