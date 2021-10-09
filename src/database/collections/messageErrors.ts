import { DeleteResult } from 'mongodb';
import { DbContext } from '../../typings/DbContext';

const collection = 'messageErrors';

export const insertMessageError = async ({db, session}: DbContext, messageId: string, errorMessage: string, stackTrace: string|null) => {
    const document = {
        messageId,
        errorMessage,
        stackTrace,
        insertionTime: new Date(),
    };
    await db.collection(collection).insertOne(document);
};

export const deleteOldMessageErrors = async ({db, session}: DbContext, dateTime: Date): Promise<DeleteResult> => {
    return await db.collection(collection).deleteMany({insertionTime: {$lt: dateTime}});
};
