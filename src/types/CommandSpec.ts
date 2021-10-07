import { Client, Message } from "discord.js";

export type CommandSpec = {
    name: string,
    description: string,
    trainingSet: string[],
    run: (client: Client, message: Message, text: string) => Promise<void>
}