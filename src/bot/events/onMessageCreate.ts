import { Client, Message } from "discord.js";
import {BayesClassifier, PorterStemmer, WordTokenizer} from 'natural';
import { classify } from "../../nlp/commandClassifier";
import sampleMessages from "../sampleMessages";

const prefix = process.env.CMD_PREFIX || '!';

export default async (client: Client, message: Message) => {
    if(message.author.id === client.user?.id || !message.content.startsWith(prefix)) {
        return;
    }
    const text = message.content.substring(prefix.length).trim();
    const result = classify(text);
    switch(result.status) {
        case 'success':
            await result.command?.run(client, message, text);
            break;
        case 'no results':
            await message.channel.send(sampleMessages('noIdea'));
            break;
        case 'multiple results':
            await message.channel.send(sampleMessages('unsure'));
            break;
    }
}