import { Client, Message } from "discord.js";

export type CommandRestriction = 'guildOnly';

export type CommandSpec = {
    name: string,
    description: string,
    trainingSet: string[],
    restrictions?: CommandRestriction[]
    run: (client: Client, message: Message, text: string) => Promise<void>
}