import { Guild } from "discord.js";
import { withSession } from "../../../database";
import { readBirthdays } from "../../../database/collections/birthdays";
import { CommandSpec } from "../../../typings/CommandSpec";

export const showBirthday: CommandSpec = {
    name: 'show birthday',
    description: 'show all registered birthdays',
    trainingSet: [
        'show birthdays',
        'known birthdays',
        'everyones birthdays'
    ],
    restrictions: ['guildOnly'],
    run: async (client, message, text) => {
        const guild = message.guild as Guild;
        const birthdays = await withSession(async ctx => {
            return await readBirthdays(ctx, guild.id);
        });
        if(birthdays.length === 0) {
            await message.channel.send(`I don't know any birthdays yet. Try something like "set my birthday to 9/2/94"`);
        } else {
            const dates = birthdays.map(b => `${b.birthday.month}/${b.birthday.day}`);
            const output = `These are the birthdays I know so far:\n  ${birthdays.map((b, i) => `${b.name}: ${dates[i]}`).join('\n  ')}`
            await message.channel.send(output);
        }
    }
}
