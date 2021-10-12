import { Client, Guild, NewsChannel, TextChannel, User } from "discord.js";


export const getPostableChannel = async (client: Client, guild: Guild): Promise<TextChannel|NewsChannel|null> => {
    if(!client.user) {
        return null;
    }
    const channels = await guild.channels.fetch();
    const member = await guild.members.fetch({user: client.user});
    const channel = channels.find(c => 
        c.isText() && c.permissionsFor(member).has(['SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'VIEW_CHANNEL'], true));

    return !channel || !channel.isText() ? null : channel;
}