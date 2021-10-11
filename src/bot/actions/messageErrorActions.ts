import { Client, User } from "discord.js";
import { withSession } from '../../database/index';
import { insertMessageError, readMessageError } from '../../database/collections/messageErrors';
import { Message } from 'discord.js';
import emoji from '../data/emoji';
import { isAdmin } from "./adminActions";


export const saveMessageError = async (message: Message, error: Error|string) => {
    const text = error instanceof Error ? error.message : error;
    const stackTrace = error instanceof Error ? error.stack as string : null;
    await withSession(async ctx => {
        await insertMessageError(ctx, message.id, text, stackTrace);
    });
    message.react(emoji.x);
}

export const sendMessageError = async (message: Message, user: User) => {
    if(user.dmChannel === null) {
        return;
    }
    const messageError = await withSession(async ctx => {
        return await readMessageError(ctx, message.id);
    });
    if(messageError === null) {
        return;
    }
    const output = messageError.stackTrace === null || !isAdmin(user.id) ? messageError.errorMessage : `\`\`\`\n${messageError.errorMessage}\n${messageError.stackTrace}\n\`\`\``;
    await user.dmChannel.send(output);
}