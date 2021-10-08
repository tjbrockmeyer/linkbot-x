import { Guild, GuildMember, User } from "discord.js";
import { CommandSpec } from "../../../typings/CommandSpec";
import { findDateInText } from "../../../utils/date";
import { fuzzySearch, searchGuildMembers } from "../../../utils/search";
import { joinWithAnd, findBirthdayOwnerInText } from "../../../utils/strings";


const validate = (date: Date|null, target: User[]|GuildMember[]|null) => {
    const errors = [];
    if(date === null) {
        errors.push('What is the date of your birthday? I can process a few different formats, but try something like 9/2/94');
    }
    if(target === null) {
        errors.push('Whose birthday should I register? Ask me again, but include the name of someone in the Guild, like "...Tyler\'s birthday..."');
    } else if(target.length === 0) {
        errors.push('It looks like you were referring to someone who isn\'t in the Guild. Use someone\'s username or nickname, like "...Tyler\'s birthday..."');
    } else if(target.length > 1) {
        const names = target.map(x => {
            const member = x as GuildMember;
            return `${member.displayName} (${member.user.username}#${member.user.discriminator})`;
        });
        errors.push(`I couldn't decide which person you were talking about. I found ${joinWithAnd(names)}. Try again while being a bit more specific.`);
    }
    return errors;
}

export const setBirthday: CommandSpec = {
    name: 'set birthday',
    description: 'register your birthday to receive notifications in the chat when that day comes around again',
    trainingSet: [
        'set birthday',
        'register birthday'
    ],
    restrictions: ['guildOnly'],
    run: async (client, message, text) => {
        const date = findDateInText(text);
        const birthdayOwnerText = findBirthdayOwnerInText(text);
        const target = text.includes('my birthday') ? [message.author] : birthdayOwnerText ? await searchGuildMembers(message.guild, birthdayOwnerText) : null;
        
        const errors = validate(date, target);
        if(errors.length) {
            await message.channel.send(`I had some issues completing your request:\n  - ${errors.join('\n  - ')}`)
        }

        // add the birthday info to the database and return a message.
    }
}
