import { UpsertResult } from '../../typings/DbResults';
import { DbContext } from '../../typings/DbContext';
import { Birthday } from '../../typings/database/Birthday';
import { WithId } from 'mongodb';

const collection = 'birthdays';

export const ensureBirthdaysCollection = async ({db, session}: DbContext) => {
    try {
        await db.createCollection(collection);
    } catch(error) {
        if(!(error as Error).message.includes('already exists')) {
            throw error
        }
    }
    await db.collection(collection).createIndexes([
        {key: {guildId: 1, name: 1}, unique: true},
        {key: {birthday: 1}}
    ]);
};

export const upsertBirthday = async ({db, session}: DbContext, guildId: string, name: string, date: Date): Promise<UpsertResult> => {
    const birthday = {month: date.getMonth() + 1, day: date.getDate()}
    const result = await db.collection(collection).updateOne({guildId, name}, {$set: {birthday}}, {upsert: true});
    return {
        upserted: result.upsertedCount > 0,
        upsertedCount: result.upsertedCount
    };
};

export const readBirthdays = async ({db, session}: DbContext, guildId?: string, date?: Date): Promise<WithId<Birthday>[]> => {
    const cursor = db.collection(collection).find();
    const results = await cursor.filter({guildId, date}).toArray();
    return results as WithId<Birthday>[]
};