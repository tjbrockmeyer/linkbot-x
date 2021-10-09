import { Client } from "discord.js";
import { withSession } from '../../database/index';
import { insertMessageError } from '../../database/collections/messageErrors';
import { Message } from 'discord.js';
import emoji from '../data/emoji';


export const saveMessageError = async (message: Message, error: Error|string) => {
    const text = error instanceof Error ? error.message : error;
    const stackTrace = error instanceof Error ? error.stack as string : null;
    await withSession(async ctx => {
        await insertMessageError(ctx, message.id, text, stackTrace);
    });
    message.react(emoji.x);
}