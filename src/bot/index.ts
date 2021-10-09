import { Client, Intents } from "discord.js";
import {onMessageCreate, onWarn, onError, onReady, onMessageReactionAdd} from './events';

export default async (token: string): Promise<Client> => {
    const bot = new Client({intents: [
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
    ]});
    bot.on('messageCreate', async (message) => await onMessageCreate(bot, message));
    bot.on('messageReactionAdd', async (reaction, user) => await onMessageReactionAdd(bot, reaction, user));
    bot.on('warn', async (message) => await onWarn(bot, message));
    bot.on('error', async (error) => await onError(bot, error));
    bot.on('ready', onReady);
    await bot.login(token);
    return bot;
}
