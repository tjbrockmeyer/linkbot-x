import { UpsertResult } from '../../typings/DbResults';
import { DbContext } from '../../typings/DbContext';

const dateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

export const upsertBirthday = async ({db, session}: DbContext, guildId: string, name: string, date: Date): Promise<UpsertResult> => {
    const result = await db.collection('birthdays').updateOne({guildId, name}, {$set: {date: dateOnly(date)}}, {upsert: true});
    return {
        upserted: result.upsertedCount > 0,
        upsertedCount: result.upsertedCount
    };
};