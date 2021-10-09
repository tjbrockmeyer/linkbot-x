import { DbContext as database } from './../typings/DbContext';

import getConfig from '../utils/config';
import {MongoClient, Db, DbOptions, ClientSession} from 'mongodb';

export const withSession = async <T>(
        task: (ctx: database) => Promise<T>, dbName: string|undefined = undefined, dbOptions: DbOptions|undefined = undefined): Promise<T> => {
            
    const {
        content: {databaseArgs}, 
        parameters: {database: {protocol, url}, databaseUser: {user, password}}
    } = await getConfig();
    const uri = `${protocol}://${user}:${password}@${url}${!databaseArgs ? '' : ('?' + databaseArgs.join('&'))}`;
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