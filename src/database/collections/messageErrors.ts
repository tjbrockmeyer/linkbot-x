import { DeleteResult, WithId } from 'mongodb';
import { MessageError } from '../../typings/database/MessageError';
import { DbContext } from '../../typings/DbContext';

const collection = 'messageErrors';

export const ensureMessageErrorIndexes = async ({db}: DbContext) => {
    await db.collection(collection).createIndexes([
        {key: {messageId: 1}, unique: true},
        {key: {insertionTime: 1}, expireAfterSeconds: 3 * 24 * 60 * 60},
    ])
};

export const insertMessageError = async ({db, session}: DbContext, messageId: string, errorMessage: string, stackTrace: string|null) => {
    const document: MessageError = {
        messageId,
        errorMessage,
        stackTrace,
        insertionTime: new Date(),
    };
    await db.collection(collection).insertOne(document);
};

export const readMessageError = async ({db, session}: DbContext, messageId: string): Promise<WithId<MessageError> | null> => {
    const result = await db.collection(collection).findOne({messageId});
    return result as WithId<MessageError> | null;
}
