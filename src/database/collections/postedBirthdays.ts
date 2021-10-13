import { Db, ObjectId } from "mongodb";
import { DbContext } from "../../typings/DbContext";

const collection = 'postedBirthdays';

export const ensurePostedBirthdayIndexes = async ({db}: DbContext) => {
    await db.collection(collection).createIndex({insertionTime: 1}, {expireAfterSeconds: 24 * 60 * 60});
};

export const getPostedBirthdayStatus = async ({db, session}: DbContext, ids: ObjectId[]): Promise<boolean[]> => {
    const cursor = db.collection(collection).find();
    const results = new Set(await cursor.filter({_id: {$in: ids}}).map(doc => doc._id.toString()).toArray());
    return ids.map(id => results.has(id.toString()));
};

export const insertPostedBirthdays = async ({db, session}: DbContext, ids: ObjectId[]) => {
    const insertionTime = new Date();
    await db.collection(collection).insertMany(ids.map(_id => ({_id, insertionTime})))
};