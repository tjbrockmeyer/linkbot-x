import { CommandSpec } from './../typings/CommandSpec';
import { runCommand } from './commands/index';
import { Client, Message, MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import { classify } from "./commands/commandClassifier";
import { getRandomResponse } from "./data/responses";
import { saveMessageError } from './actions/messageErrorActions';
import { startCheckBirthdaysProcess } from '../backgroundProcesses';

const prefix = process.env.CMD_PREFIX || '!';

export const onMessageCreate = async (client: Client, message: Message) => {
    if(message.author.id === client.user?.id || !message.content.startsWith(prefix)) {
        return;
    }
    const text = message.content.substring(prefix.length).trim();
    const result = classify(text);
    switch(result.status) {
        case 'success':
            await runCommand(result.command as CommandSpec, client, message, text);
            break;
        case 'no results':
            await saveMessageError(message, getRandomResponse('noIdea'));
            break;
        case 'multiple results':
            await saveMessageError(message, getRandomResponse('unsure'));
            break;
    }
}


export const onMessageReactionAdd = async (client: Client, reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
    console.info('reaction added:', reaction.emoji.name);
}

export const onReady = async (client: Client) => {
    console.info('connected to discord');
    startCheckBirthdaysProcess(client);
}

export const onWarn = async (client: Client, message: string) => {
    console.warn('a client warning occurred:', message);
}

export const onError = async (client: Client, error: Error) => {
    console.error('a client error occurred:', error);
}