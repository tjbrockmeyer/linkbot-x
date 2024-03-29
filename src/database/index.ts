import {MongoClient, DbOptions} from 'mongodb';
import { DbContext as database } from './../typings/DbContext';
import { config } from '../config';

export const withSession = async <T>(
        task: (ctx: database) => Promise<T>, dbName: string|undefined = undefined, dbOptions: DbOptions|undefined = undefined): Promise<T> => {
    const {
        database: {
            args,
            protocol,
            url,
            user,
            password,
        }
    } = config;
    const uri = `${protocol}://${user}:${password}@${url}/admin${!args || !args.length ? '' : ('?' + args.join('&'))}`;
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