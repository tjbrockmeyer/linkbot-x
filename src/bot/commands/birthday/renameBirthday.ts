import { sendSuccess } from '../../actions/sendMessageActions';
import { upsertBirthday } from '../../../database/collections/birthdays';
import { withSession } from './../../../database/index';
import { Guild, GuildMember, User } from "discord.js";
import { CommandSpec } from "../../../typings/CommandSpec";
import { findDateInText } from "../../../utils/dates";
import { findBirthdayOwnerInText } from "../../../utils/strings";
import { saveMessageError } from '../../actions/messageErrorActions';

export const setBirthday: CommandSpec = {
    name: 'rename in birthdays',
    description: 'rename someone in a registered birthday, for the case that their name is spelled wrong or something',
    trainingSet: [
        'rename _ to _ in birthdays',
        'in birthdays, rename _ to _'
    ],
    restrictions: ['guildOnly'],

    run: async (client, message, text) => {
        const guild = message.guild as Guild;
        const member = message.member as GuildMember;
        const maybeDate = findDateInText(text);
        const birthdayOwnerText = findBirthdayOwnerInText(text);
        const maybeTarget = birthdayOwnerText === 'self' ? member.displayName : birthdayOwnerText;

        const errors = validate(maybeDate, maybeTarget, birthdayOwnerText);
        if(errors.length) {
            await saveMessageError(message, `I had some issues completing the request:\n  - ${errors.join('\n  - ')}`);
            return;
        }

        await withSession(async ctx => {
            await upsertBirthday(ctx, guild.id, maybeTarget as string, maybeDate as Date);
        });
        await sendSuccess(message);
    }
}

const validate = (date: Date|null, target: string|null, ownerText: string|null): string[] => {
    const errors = [];
    if(target === null) {
        errors.push('Whose birthday should I register? Ask me again, but include the name of someone, like "...Tyler\'s birthday..."');
    }
    if(date === null) {
        errors.push(`What\'s ${target === null ? 'the' : ownerText === 'self' ? 'your' : `${target}'s`} birthday? I can process a few different formats, but try something like 9/2/94`);
    }
    return errors;
}
