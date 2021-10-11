import { DeleteResult } from 'mongodb';
import { MessageError } from '../../typings/database/MessageError';
import { DbContext } from '../../typings/DbContext';

const collection = 'messageErrors';

export const insertMessageError = async ({db, session}: DbContext, messageId: string, errorMessage: string, stackTrace: string|null) => {
    const document: MessageError = {
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

export const readMessageError = async ({db, session}: DbContext, messageId: string): Promise<MessageError|null> => {
    const result = await db.collection(collection).findOne({messageId});
    return result as MessageError|null;
}
