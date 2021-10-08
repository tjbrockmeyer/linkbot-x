import { Client, Intents } from "discord.js";
import onError from "./events/onError";
import onMessageCreate from "./events/onMessageCreate";
import onReady from "./events/onReady";
import onWarn from "./events/onWarn";

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
    bot.on('messageCreate', async message => await onMessageCreate(bot, message));
    bot.on('warn', async message => await onWarn(bot, message));
    bot.on('error', async error => await onError(bot, error));
    bot.on('ready', onReady);
    await bot.login(token);
    return bot;
}
