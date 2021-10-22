import { Channel, Client, ClientUser, Collection, Guild, GuildChannel, GuildChannelManager, GuildManager, GuildMember, GuildMemberManager, Message, OAuth2Guild, Permissions, StageChannel, TextChannel, User, VoiceChannel } from "discord.js";
import { ClientSession, Db } from "mongodb";
import { SinonStub, stub } from "sinon";
import { StubbedInstance, stubInterface } from "ts-sinon";
import * as database from '../database';
import { DbContext } from "../typings/DbContext";

export interface DbStub {
    db: StubbedInstance<Db>,
    session: StubbedInstance<ClientSession>,
    ctx: DbContext,
    withSession: SinonStub,
};

export const stubDb = (): DbStub => {
    const db = stubInterface<Db>();
    const session = stubInterface<ClientSession>();
    const ctx: DbContext = {db, session};
    const fake = async (task: (ctx: DbContext) => Promise<any>) => await task(ctx);
    const stub_withSession = stub(database, 'withSession').callsFake(fake);
    return {db, session, ctx, withSession: stub_withSession};
};

export const stubGuildManager = (guilds: Guild[] | Guild): StubbedInstance<GuildManager> => {
    const guildManager = stubInterface<GuildManager>({
        fetch: Promise.resolve(guilds as unknown as Collection<string, OAuth2Guild>),
        valueOf: guilds as unknown as Collection<string, Guild>,
    });
    return guildManager;
}

export const stubGuildChannelManager = (channels: GuildChannel[] | GuildChannel): StubbedInstance<GuildChannelManager> => {
    const guildChannelManager = stubInterface<GuildChannelManager>({
        fetch: Promise.resolve(channels as any),
        valueOf: channels as any,
    });
    return guildChannelManager;
}

export const stubGuildMemberManager = (members: GuildMember[] | GuildMember): StubbedInstance<GuildMemberManager> => {
    const guildMemberManager = stubInterface<GuildMemberManager>({
        fetch: Promise.resolve(members as any),
        valueOf: members as any,
    });
    return guildMemberManager;
}

export const stubClient = (): StubbedInstance<Client> => {
    const client = stubInterface<Client>();
    client.user = stubInterface<ClientUser>();
    client.user.id = 'client user id';
    return client;
}

export const stubPermissions = () => {
    return stubInterface<Permissions>({
        has: true,
        valueOf: undefined,
    });
}

export const stubTextChannel = (): StubbedInstance<TextChannel> => {
    const channel = stubInterface<TextChannel>({
        isText: true,
        send: undefined,
        sendTyping: undefined,
        permissionsFor: stubPermissions(), 
        toString: '#text-channel',
    });
    return channel;
}

export const stubVoiceChannel = (): StubbedInstance<VoiceChannel> => {
    const channel = stubInterface<VoiceChannel>({
        isText: false,
        toString: '<#voice-channel>',
        valueOf: 'voice-channel',
    });
    return channel;
}

export const stubGuild = (id: string = 'guild id', systemChannel?: TextChannel): StubbedInstance<Guild> => {
    const guild = stubInterface<Guild>();
    guild.id = id;
    Object.defineProperty(guild, 'systemChannel', {value: systemChannel, configurable: true});
    return guild;
}

export const stubMessage = (content: string, id: string = 'message id'): StubbedInstance<Message> => {
    const author = stubInterface<User>();

    const authorMember = stubInterface<GuildMember>();
    authorMember.user = author;
    Object.defineProperty(authorMember, 'displayName', {value: 'author member display name', configurable: true});

    const guild = stubGuild('message guild id');
    const channel = stubTextChannel();

    const message = stubInterface<Message>({
        react: undefined,
        toString: 'this is a message',
        valueOf: 'this is the value of the message'
    });
    message.id = id;
    message.content = content;
    message.author = author;
    Object.defineProperty(message, 'channel', {value: channel, configurable: true});
    Object.defineProperty(message, 'guild', {value: guild, configurable: true});
    Object.defineProperty(message, 'member', {value: authorMember, configurable: true});

    return message;
};