import { Client, Intents } from "discord.js";
import onMessage from "./events/messageCreate";

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
    bot.on('messageCreate', async message => await onMessage(bot, message));
    bot.on('warn', async message => console.warn(message));
    bot.on('ready', async () => console.info(`connected to discord: ${bot.user?.username}`));
    await bot.login(token);
    return bot;
}
