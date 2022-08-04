import { Client, Intents } from "discord.js";
import { stringifyError } from "../utils/objects";
import {onMessageCreate, onWarn, onError, onReady, onMessageReactionAdd} from './events';

const safeResolve = async (promise: Promise<void>) => {
    try {
        await promise;
    } catch(error) {
        console.error(stringifyError(error));
    }
};
2
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
    bot.on('messageCreate', async (message) => safeResolve(onMessageCreate(bot, message)));
    bot.on('messageReactionAdd', async (reaction, user) => safeResolve(onMessageReactionAdd(bot, reaction, user)));
    bot.on('warn', async (message) => safeResolve(onWarn(bot, message)));
    bot.on('error', async (error) => safeResolve(onError(bot, error)));
    bot.on('ready', async (client) => safeResolve(onReady(client)));
    await bot.login(token);
    return bot;
}
