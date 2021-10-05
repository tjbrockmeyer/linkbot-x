
import getConfig from './config';
import {MongoClient} from 'mongodb';

const connect = async () => {
    const {
        content: {databaseArgs}, 
        parameters: {database: {protocol, url}, databaseUser: {user, password}}
    } = await getConfig();
    const uri = `${protocol}://${user}:${password}@${url}${!databaseArgs ? '' : ('?' + databaseArgs.join('&'))}`;
    const client = await MongoClient.connect(uri);
    const db = client.db();
    client.connect(err => {
        const collection = client.db("test").collection("birthdays");
        const cursor = collection.find({
            birthday: new Date('2000-09-02T00:00:00.000Z')
        });
        client.close();
    });
}