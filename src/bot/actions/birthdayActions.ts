import { Client, User } from "discord.js";
import { WithId } from "mongodb";
import { withSession } from "../../database"
import { readBirthdays } from "../../database/collections/birthdays"
import { getPostedBirthdayStatus, insertPostedBirthdays } from "../../database/collections/postedBirthdays";
import { Birthday } from "../../typings/database/Birthday";
import { today } from "../../utils/dates"
import { joinWithAnd } from "../../utils/strings";
import { getPostableChannel } from "../actions/guildActions";

export const postOccurringBirthdays = async (client: Client) => {
    const birthdays = await withSession(async ctx => {
        const birthdays = await readBirthdays(ctx, undefined, today());
        const isPosted = await getPostedBirthdayStatus(ctx, birthdays.map(b => b._id));
        return birthdays.filter((_, i) => !isPosted[i]);
    });
    const guildIds = Array.from(new Set(birthdays.map(b => b.guildId)));
    for(const guildId of guildIds) {
        const filteredBirthdays = birthdays.filter(b => b.guildId === guildId);
        const output = filteredBirthdays.length === 1 
            ? `Today is ${filteredBirthdays[0].name}'s birthday!`
            : `Today is ${joinWithAnd(filteredBirthdays.map(b => b.name))}\'s birthdays!`;
        const guild = await client.guilds.fetch(guildId);
        const channel = guild.systemChannel || await getPostableChannel(client, guild);
        if(channel) {
            await channel.send(output);
            await withSession(async ctx => {
                await insertPostedBirthdays(ctx, birthdays.map(b => b._id));
            });
        }
        // silently fail if there is not a postable channel for the bot.
    }
}