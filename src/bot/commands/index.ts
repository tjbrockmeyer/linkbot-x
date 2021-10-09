import { sendMessage } from '../actions/sendMessageActions';
import { Client, Emoji, Message } from 'discord.js';
import emoji from '../data/emoji';
import { CommandSpec } from './../../typings/CommandSpec';
import { saveMessageError } from '../actions/messageErrorActions';


export const runCommand = async (command: CommandSpec, client: Client, message: Message, text: string) => {
    if(command.restrictions) {
        const errors = command.restrictions.map(restriction => {
            switch(restriction) {
                case 'guildOnly':
                    return message.guild === null ? `I can only '${command.name}' in a Guild.` : null;
            }
        }).filter(Boolean);

        if(errors.length) {
            await saveMessageError(
                message,
                `I couldn't complete your request:\n  - ${errors.join('\n  - ')}`);
            return;
        }
    }

    try {
        await command.run(client, message, text);
    } catch(error) {
        console.error(error);
        saveMessageError(message, error as Error);
    }
}