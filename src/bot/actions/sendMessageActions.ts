import { Message, TextBasedChannels } from "discord.js";
import emoji from "../data/emoji";


export const sendMessage = async (channel: TextBasedChannels, text: string) => {
    await channel.send(text);
}

export const sendSuccess = async (message: Message) => {
    await message.react(emoji.whiteCheckMark);
}