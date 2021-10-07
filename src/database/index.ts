
import getConfig from '../utils/config';
import {MongoClient, Db, DbOptions, ClientSession} from 'mongodb';

const withSession = async (task: (db: Db, session: ClientSession) => Promise<unknown>, 
                           dbName: string|undefined = undefined, 
                           dbOptions: DbOptions|undefined = undefined) => {
    const {
        content: {databaseArgs}, 
        parameters: {database: {protocol, url}, databaseUser: {user, password}}
    } = await getConfig();
    const uri = `${protocol}://${user}:${password}@${url}${!databaseArgs ? '' : ('?' + databaseArgs.join('&'))}`;
    const client = await MongoClient.connect(uri);
    const session = client.startSession();
    const db = client.db(dbName, dbOptions);
    try {
        await task(db, session);
    } finally {
        await session.endSession();
        await client.close();
    }
}