import { Guild, GuildMember, User } from "discord.js";
import { CommandSpec } from "../../../typings/CommandSpec";
import { findDateInText } from "../../../utils/date";
import { fuzzySearch, searchGuildMembers } from "../../../utils/search";
import { joinWithAnd, findBirthdayOwnerInText } from "../../../utils/strings";

export const setBirthday: CommandSpec = {
    name: 'set birthday',
    description: 'register your birthday to receive notifications in the chat when that day comes around again',
    trainingSet: [
        'set birthday',
        'register birthday'
    ],
    run: async (client, message, text) => {
        if(!message.guild) {
            await message.channel.send('I only support birthday functionality inside a Guild/Server');
            return;
        }

        const date = findDateInText(text);
        const birthdayOwnerText = findBirthdayOwnerInText(text);

        if(date === null) {
            await message.channel.send('What is the date of your birthday? I can process a few different formats, but try something like 9/2/94');
            return;
        }
        const target = text.includes('my birthday') ? [message.author] : birthdayOwnerText ? await searchGuildMembers(message.guild, birthdayOwnerText) : null;
        if(target === null) {
            await message.channel.send('Whose birthday should I register? Ask me again, but include someone in the Guild\'s name, like "...Tyler\'s birthday..."');
            return;
        }
        if(target.length === 0) {
            await message.channel.send('I couldn\'t figure out who you were talking about. Use the name of someone in the Guild, like "...Tyler\'s birthday..."');
            return;
        }
        if(target.length > 1) {
            const names = target.map(x => {
                const member = x as GuildMember;
                return `${member.displayName} (${member.user.username}#${member.user.discriminator})`;
            });
            await message.channel.send(`I couldn't decide which person you were talking about. I found ${joinWithAnd(names)}. Try again while being a bit more specific.`);
            return;
        }

        // add the birthday info to the database and return a message.
    }
}
