import { UpsertResult } from '../../typings/DbResults';
import { DbContext } from '../../typings/DbContext';
import { Birthday } from '../../typings/database/Birthday';

const collection = 'birthdays';

const dateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

export const upsertBirthday = async ({db, session}: DbContext, guildId: string, name: string, date: Date): Promise<UpsertResult> => {
    const result = await db.collection(collection).updateOne({guildId, name}, {$set: {date: dateOnly(date)}}, {upsert: true});
    return {
        upserted: result.upsertedCount > 0,
        upsertedCount: result.upsertedCount
    };
};

export const readBirthdays = async ({db, session}: DbContext, guildId: string): Promise<Birthday[]> => {
    const cursor = db.collection(collection).find();
    const results = await cursor.filter({guildId}).toArray();
    return results as Birthday[]
};