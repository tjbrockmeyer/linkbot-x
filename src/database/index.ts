import { DbContext as database } from './../typings/DbContext';

import {getConfig} from '../config';
import {MongoClient, DbOptions} from 'mongodb';

export const withSession = async <T>(
        task: (ctx: database) => Promise<T>, dbName: string|undefined = undefined, dbOptions: DbOptions|undefined = undefined): Promise<T> => {
    const {
        general: {databaseArgs}, 
        secrets: {dbProtocol, dbUrl, dbUser, dbPassword},
    } = await getConfig();
    const uri = `${dbProtocol}://${dbUser}:${dbPassword}@${dbUrl}${!databaseArgs ? '' : ('?' + databaseArgs.join('&'))}`;
    const client = await MongoClient.connect(uri);
    const session = client.startSession();
    const db = client.db(dbName, dbOptions);
    try {
        return await task({db, session});
    } finally {
        await session.endSession();
        await client.close();
    }
}