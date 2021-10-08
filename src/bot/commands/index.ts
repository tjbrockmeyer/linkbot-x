import { Client, Message } from 'discord.js';
import { CommandSpec } from './../../typings/CommandSpec';


export const runCommand = async (command: CommandSpec, client: Client, message: Message, text: string) => {
    if(command.restrictions) {
        const errors = command.restrictions.map(restriction => {
            switch(restriction) {
                case 'guildOnly':
                    return message.guild === null ? `I can only '${command.name}' in a Guild.` : null;
                default:
                    return null;
            }
        }).filter(Boolean);

        if(errors.length) {
            await message.channel.send(
                `I encountered ${errors.length > 1 ? 'some issues' : 'an issue'} while responding to your request:\n  - ${errors.join('\n  - ')}`);
            return;
        }
    }

    await command.run(client, message, text);
}